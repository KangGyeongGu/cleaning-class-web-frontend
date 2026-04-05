/**
 * 배포 후 Next.js 이미지 최적화 캐시 워밍 스크립트
 *
 * /_next/image 엔드포인트를 주요 deviceSizes별로 호출하여
 * 모바일/태블릿/데스크톱 모든 기기의 캐시를 사전 생성합니다.
 *
 * 사용법:
 *   node scripts/warm-cache.mjs
 *   node scripts/warm-cache.mjs --pages 5    # /reviews 5페이지까지
 *   node scripts/warm-cache.mjs --dry-run    # URL만 출력
 */

const SITE_URL = "https://www.cleaningclass.co.kr";
const SUPABASE_URL = "https://gezvfabmalvpnumewwgu.supabase.co";
const STORAGE_BASE = "/storage/v1/object/public";

const IMAGE_QUALITY = 75;
const DELAY_MS = 200;
const CONCURRENCY = 5;

// 이미지 유형별 워밍할 width 목록
// 실제 sizes 속성 + deviceSizes 기반으로 브라우저가 선택할 수 있는 width
const WARM_WIDTHS = {
  "hero-images": [390, 640, 828, 1080, 1200], // 모바일~데스크톱 전체
  "service-images": [390, 430, 640],           // 모바일 2열, 태블릿 3열, 데스크톱 5열
  "review-images": [390, 430, 640],            // 모바일 1열, 태블릿 2열, 데스크톱 4열
};

const args = process.argv.slice(2);
const DRY_RUN = args.includes("--dry-run");

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Supabase에서 게시된 리뷰의 image_path 목록을 직접 조회 */
async function fetchReviewImagePaths() {
  const SUPABASE_KEY = "sb_publishable_BUKcxZf8teXYnLUR4YP1ng_qlv3CjZT";
  const url = `${SUPABASE_URL}/rest/v1/reviews?select=image_path&is_published=eq.true&order=created_at.desc`;

  const res = await fetch(url, {
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
    },
  });

  if (!res.ok) throw new Error(`Supabase API error: ${res.status}`);
  const rows = await res.json();
  return rows.map((r) => r.image_path).filter(Boolean);
}

/** 페이지 HTML에서 이미지 경로 추출 */
async function extractImagePaths(pageUrl) {
  const res = await fetch(pageUrl, {
    headers: { "User-Agent": "CacheWarmer/1.0" },
  });
  const html = await res.text();

  const regex = /(hero-images|service-images|review-images)\/([a-f0-9-]+\.\w+)/g;
  const paths = [];
  let match;
  while ((match = regex.exec(html)) !== null) {
    paths.push({ bucket: match[1], file: match[2] });
  }
  return paths;
}

/** /_next/image 엔드포인트 호출 */
async function warmImage(originalUrl, width) {
  const nextImageUrl = `${SITE_URL}/_next/image?url=${encodeURIComponent(originalUrl)}&w=${width}&q=${IMAGE_QUALITY}`;
  const shortName = originalUrl.split("/").pop();

  if (DRY_RUN) {
    console.log(`  [DRY] ${shortName} @${width}px`);
    return true;
  }

  try {
    const res = await fetch(nextImageUrl, {
      headers: {
        "User-Agent": "CacheWarmer/1.0",
        Accept: "image/avif,image/webp,*/*",
      },
    });
    if (!res.ok) {
      console.error(`  ❌ ${shortName} @${width}px — HTTP ${res.status}`);
      return false;
    }
    await res.arrayBuffer();
    return true;
  } catch (err) {
    console.error(`  ❌ ${shortName} @${width}px — ${err.message}`);
    return false;
  }
}

/** 동시성 제한 batch */
async function warmBatch(tasks) {
  let success = 0;
  let fail = 0;

  for (let i = 0; i < tasks.length; i += CONCURRENCY) {
    const batch = tasks.slice(i, i + CONCURRENCY);
    const results = await Promise.all(
      batch.map((t) => warmImage(t.url, t.width)),
    );
    success += results.filter(Boolean).length;
    fail += results.filter((r) => !r).length;

    if ((i + CONCURRENCY) % 50 < CONCURRENCY && i > 0) {
      console.log(`  진행: ${Math.min(i + CONCURRENCY, tasks.length)}/${tasks.length}`);
    }

    if (i + CONCURRENCY < tasks.length) {
      await sleep(DELAY_MS);
    }
  }

  return { success, fail };
}

async function main() {
  const startTime = Date.now();
  console.log("🔥 이미지 캐시 워밍 시작 (전체 + 다중 width)\n");
  console.log(`  사이트: ${SITE_URL}`);
  console.log(`  동시 요청: ${CONCURRENCY}`);
  console.log(`  DRY_RUN: ${DRY_RUN}\n`);

  // 1) SSR 페이지에서 히어로/서비스 이미지 수집
  console.log("📋 SSR 페이지 이미지 수집...\n");
  const ssrPages = [SITE_URL, `${SITE_URL}/services`];
  /** @type {{ bucket: string, file: string }[]} */
  const ssrImages = [];

  for (const pageUrl of ssrPages) {
    try {
      const paths = await extractImagePaths(pageUrl);
      // 중복 제거
      for (const p of paths) {
        if (!ssrImages.some((s) => s.bucket === p.bucket && s.file === p.file)) {
          ssrImages.push(p);
        }
      }
      console.log(`  ${pageUrl} → ${paths.length}개 이미지`);
    } catch (err) {
      console.error(`  ⚠️ ${pageUrl} 접근 실패: ${err.message}`);
    }
  }

  // 2) Supabase에서 리뷰 이미지 전체 조회
  console.log("\n📋 Supabase에서 리뷰 이미지 조회...\n");
  let reviewFiles = [];
  try {
    reviewFiles = await fetchReviewImagePaths();
    console.log(`  게시된 리뷰 전체 ${reviewFiles.length}개`);
  } catch (err) {
    console.error(`  ⚠️ Supabase 조회 실패: ${err.message}`);
  }

  // 3) 워밍 태스크 생성 (이미지 × width 조합)
  /** @type {{ url: string, width: number }[]} */
  const tasks = [];

  // SSR 이미지 (히어로, 서비스) — 버킷별 width 적용
  for (const { bucket, file } of ssrImages) {
    const url = `${SUPABASE_URL}${STORAGE_BASE}/${bucket}/${file}`;
    const widths = WARM_WIDTHS[bucket] || [390, 640];
    for (const w of widths) {
      tasks.push({ url, width: w });
    }
  }

  // 리뷰 이미지 — review-images width 적용
  const reviewWidths = WARM_WIDTHS["review-images"];
  for (const file of reviewFiles) {
    const url = `${SUPABASE_URL}${STORAGE_BASE}/review-images/${file}`;
    for (const w of reviewWidths) {
      tasks.push({ url, width: w });
    }
  }

  console.log(`\n총 워밍 태스크: ${tasks.length}개 (이미지 × width 조합)\n`);

  // 버킷별 통계
  const stats = {};
  for (const t of tasks) {
    const bucket = t.url.includes("hero") ? "hero" : t.url.includes("service") ? "service" : "review";
    stats[bucket] = (stats[bucket] || 0) + 1;
  }
  for (const [bucket, count] of Object.entries(stats)) {
    console.log(`  ${bucket}: ${count}개 태스크`);
  }

  if (tasks.length === 0) {
    console.log("워밍할 이미지가 없습니다.");
    return;
  }

  // 4) 캐시 워밍
  console.log("\n🖼️  캐시 워밍 중...\n");
  const { success, fail } = await warmBatch(tasks);

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log(`\n${"=".repeat(40)}`);
  console.log(`✅ 캐시 워밍 완료!`);
  console.log(`  성공: ${success}개`);
  console.log(`  실패: ${fail}개`);
  console.log(`  소요: ${elapsed}초`);
  console.log(`${"=".repeat(40)}`);
}

main().catch(console.error);
