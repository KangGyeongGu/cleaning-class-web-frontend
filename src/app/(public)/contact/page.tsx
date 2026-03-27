import type { Metadata } from "next";
import Link from "next/link";
import { getSiteConfig } from "@/shared/lib/site-config";
import { generateBreadcrumbListJsonLd } from "@/shared/lib/json-ld";
import { ContactForm } from "@/components/ContactForm";
import {
  NaverBlogIcon,
  InstagramIcon,
  DaangnIcon,
} from "@/components/icons/SocialIcons";

// ISR: 1시간마다 재검증 — site_config 변경을 주기적으로 반영
export const revalidate = 3600;

// ── 메타데이터 ──────────────────────────────────────────────────────────────

export const metadata: Metadata = {
  title: "견적문의",
  description:
    "청소클라쓰에 청소·이사 견적을 문의하세요. 전화로도 편하게 연락하실 수 있습니다.",
  openGraph: {
    title: "견적문의 | 청소클라쓰",
    description:
      "청소클라쓰에 청소·이사 견적을 문의하세요. 전화로도 편하게 연락하실 수 있습니다.",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "청소클라쓰 견적문의",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "견적문의 | 청소클라쓰",
    description:
      "청소클라쓰에 청소·이사 견적을 문의하세요. 전화로도 편하게 연락하실 수 있습니다.",
  },
};

// ── 페이지 ──────────────────────────────────────────────────────────────────

export default async function ContactPage() {
  // site_config에서 연락처 정보 조회 — ISR 캐시 적용
  const siteConfig = await getSiteConfig();

  // BreadcrumbList JSON-LD: 홈 > 견적문의
  const breadcrumbJsonLd = generateBreadcrumbListJsonLd([
    { name: "홈", url: "https://www.cleaningclass.co.kr" },
    { name: "견적문의", url: "https://www.cleaningclass.co.kr/contact" },
  ]);

  const phone = siteConfig?.phone ?? "";
  const movingPhone = siteConfig?.moving_phone ?? "";
  const blogUrl = siteConfig?.blog_url ?? "";
  const instagramUrl = siteConfig?.instagram_url ?? "";
  const daangnUrl = siteConfig?.daangn_url ?? "";

  return (
    <>
      {/* 구조화 데이터 — BreadcrumbList */}
      {/* eslint-disable-next-line @eslint-react/dom/no-dangerously-set-innerhtml -- 서버 생성 정적 데이터로 XSS 위험 없음 */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbJsonLd).replace(/</g, "\\u003c"),
        }}
      />

      <main className="min-h-screen bg-white">
        <section className="pt-12 pb-16 md:pt-16">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="grid grid-cols-1 gap-14 lg:grid-cols-[1fr_2fr] lg:gap-20">
              {/* 좌측: 제목 + 연락처 */}
              <aside>
                <div className="lg:sticky lg:top-24">
                  {/* 브레드크럼 */}
                  <nav aria-label="현재 위치" className="mb-8">
                    <ol className="flex items-center gap-2 text-xs text-slate-400">
                      <li>
                        <Link
                          href="/"
                          className="transition-colors hover:text-slate-600"
                        >
                          홈
                        </Link>
                      </li>
                      <li aria-hidden="true">/</li>
                      <li className="text-slate-900" aria-current="page">
                        견적문의
                      </li>
                    </ol>
                  </nav>

                  <h1 className="text-heading-1 mb-4">견적문의</h1>
                  <p className="text-body-sm mb-10 text-slate-500">
                    문의 후 24시간 이내에 연락드립니다.
                    <br />
                    급한 문의는 전화로 연락해 주세요.
                  </p>

                  {/* 연락처 */}
                  {phone && (
                    <div className="mb-6">
                      <p className="mb-1 text-sm font-bold text-slate-900">
                        청소 연락
                      </p>
                      <a
                        href={`tel:${phone.replace(/\D/g, "")}`}
                        className="text-sm font-light text-slate-600 underline-offset-2 transition-colors hover:text-slate-900 hover:underline"
                      >
                        {phone}
                      </a>
                    </div>
                  )}

                  {movingPhone && (
                    <div className="mb-6">
                      <p className="mb-1 text-sm font-bold text-slate-900">
                        이사 연락
                      </p>
                      <a
                        href={`tel:${movingPhone.replace(/\D/g, "")}`}
                        className="text-sm font-light text-slate-600 underline-offset-2 transition-colors hover:text-slate-900 hover:underline"
                      >
                        {movingPhone}
                      </a>
                    </div>
                  )}

                  <div className="border-t border-slate-100 pt-6">
                    <div className="flex justify-center gap-4">
                      {blogUrl && (
                        <a
                          href={blogUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label="네이버 블로그"
                          className="text-slate-400 transition-colors hover:text-slate-900"
                        >
                          <NaverBlogIcon size={20} />
                        </a>
                      )}
                      {instagramUrl && (
                        <a
                          href={instagramUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label="인스타그램"
                          className="text-slate-400 transition-colors hover:text-slate-900"
                        >
                          <InstagramIcon size={20} />
                        </a>
                      )}
                      {daangnUrl && (
                        <a
                          href={daangnUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label="당근마켓"
                          className="text-slate-400 transition-colors hover:text-slate-900"
                        >
                          <DaangnIcon size={20} />
                        </a>
                      )}
                    </div>
                  </div>

                </div>
              </aside>

              {/* 우측: 견적문의 폼 */}
              <div>
                <ContactForm />
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
