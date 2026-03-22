import type { Metadata } from "next";
import "@/app/globals.css";
import { generateLocalBusinessJsonLd } from "@/shared/lib/json-ld";
import { getSiteConfig } from "@/shared/lib/site-config";

const PRETENDARD_CSS_URL =
  "https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css";

/**
 * Pretendard CDN CSS를 fetch하여 font-display: optional로 변환.
 * - swap → optional: 폰트 미도착 시 fallback 유지, swap 없음 → LCP 재측정 차단
 * - ISR(revalidate=3600)로 캐시되므로 매 요청마다 fetch하지 않음
 * - 인라인 <style>로 삽입하여 외부 CSS 요청 및 render-blocking 완전 제거
 */
async function getPretendardCss(): Promise<string> {
  try {
    const res = await fetch(PRETENDARD_CSS_URL, { next: { revalidate: 86400 } });
    if (!res.ok) return "";
    let css = await res.text();
    // 상대 경로를 CDN 절대 경로로 변환 (인라인 시 서버 도메인 기준 해석 방지)
    const cdnBase =
      "https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/packages/pretendard/dist/web/variable/";
    css = css.replace(
      /url\(\.\.\/\.\.\/\.\.\/packages\/pretendard\/dist\/web\/variable\//g,
      `url(${cdnBase}`,
    );
    return css.replace(/font-display:\s*swap/g, "font-display:optional");
  } catch {
    return "";
  }
}

// ISR: layout 수준에서도 1시간마다 재검증
export const revalidate = 3600;

export const metadata: Metadata = {
  metadataBase: new URL("https://www.cleaningclass.co.kr"),
  title: {
    default: "청소클라쓰",
    template: "%s | 청소클라쓰",
  },
  description: "공간의 본질을 되찾는 시간. 전북 지역 전문 청소 서비스",
  openGraph: {
    type: "website",
    locale: "ko_KR",
    url: "https://www.cleaningclass.co.kr",
    siteName: "청소클라쓰",
    title: "청소클라쓰",
    description: "공간의 본질을 되찾는 시간. 전북 지역 전문 청소 서비스",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "청소클라쓰 — 전북 지역 전문 청소 서비스",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "청소클라쓰",
    description: "공간의 본질을 되찾는 시간. 전북 지역 전문 청소 서비스",
    images: [
      {
        url: "/opengraph-image",
        alt: "청소클라쓰 — 전북 전주 전문 청소 서비스",
      },
    ],
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [siteConfig, pretendardCss] = await Promise.all([
    getSiteConfig(),
    getPretendardCss(),
  ]);
  const jsonLd = generateLocalBusinessJsonLd(siteConfig);

  return (
    <html lang="ko">
      <head>
        {/* Pretendard: CDN CSS를 인라인화 + font-display:optional로 변환 */}
        {pretendardCss && (
          // eslint-disable-next-line @eslint-react/dom/no-dangerously-set-innerhtml -- 서버에서 fetch한 CDN CSS를 font-display:optional로 변환하여 인라인. XSS 위험 없음 (고정 URL)
          <style dangerouslySetInnerHTML={{ __html: pretendardCss }} />
        )}
      </head>
      <body className="antialiased font-sans">
        {/*
          JSON-LD 구조화 데이터 삽입.
          dangerouslySetInnerHTML은 Next.js 공식 권장 패턴입니다.
          @see https://nextjs.org/docs/app/building-your-application/optimizing/metadata#json-ld
          jsonLd 객체는 서버에서 생성되며 사용자 입력을 포함하지 않으므로 XSS 위험 없음.
        */}
        {/* eslint-disable @eslint-react/dom/no-dangerously-set-innerhtml -- Next.js 공식 JSON-LD 패턴, < → \u003c 치환으로 XSS 방어 적용 */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
          }}
        />
        {/* eslint-enable @eslint-react/dom/no-dangerously-set-innerhtml */}
        {children}
      </body>
    </html>
  );
}
