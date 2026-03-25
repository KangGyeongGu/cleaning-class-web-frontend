import type { Metadata, Viewport } from "next";
import Script from "next/script";
import "@/app/globals.css";
import {
  generateBreadcrumbListJsonLd,
  generateFaqPageJsonLd,
  generateLocalBusinessJsonLd,
  generateWebSiteJsonLd,
} from "@/shared/lib/json-ld";
import { getSiteConfig } from "@/shared/lib/site-config";

const GA_ID = process.env.NEXT_PUBLIC_GA_ID ?? "";
const CLARITY_ID = process.env.NEXT_PUBLIC_CLARITY_ID ?? "";

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
    const res = await fetch(PRETENDARD_CSS_URL, {
      next: { revalidate: 86400 },
    });
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

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#ffffff",
  viewportFit: "cover",
};

export const metadata: Metadata = {
  metadataBase: new URL("https://www.cleaningclass.co.kr"),
  verification: {
    google: "p_YMbf0LS_UF1H8XHrmiIYuU-qCfd4oCj6ue9YuY_Us",
    other: {
      "naver-site-verification": "b5cac6e111205c041ca91df1b9a59e5fa81635fa",
    },
  },
  title: {
    default: "청소클라쓰",
    template: "%s | 청소클라쓰",
  },
  description:
    "전주 청소업체 청소클라쓰 — 전북 전주 거주청소, 입주청소, 정기청소, 특수청소, 쓰레기집청소, 상가청소 전문 서비스",
  keywords: [
    "전주 청소업체",
    "전주 입주청소",
    "전북 거주청소",
    "전북 정기청소",
    "전북 특수청소",
    "전북 쓰레기집청소",
    "전주 상가청소",
    "전북 청소",
    "전주 청소",
    "청소클라쓰",
  ],
  openGraph: {
    type: "website",
    locale: "ko_KR",
    url: "https://www.cleaningclass.co.kr",
    siteName: "청소클라쓰",
    title: "청소클라쓰",
    description:
      "전주 청소업체 청소클라쓰 — 거주청소, 입주청소, 정기청소, 특수청소, 쓰레기집청소, 상가청소",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "청소클라쓰 — 전북 전주 전문 청소 서비스",
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
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "청소클라쓰",
  },
  alternates: {
    types: {
      "application/rss+xml": "/feed.xml",
    },
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
  const webSiteJsonLd = generateWebSiteJsonLd(siteConfig);
  const faqPageJsonLd = generateFaqPageJsonLd();
  const breadcrumbListJsonLd = generateBreadcrumbListJsonLd([
    { name: "홈", url: "https://www.cleaningclass.co.kr" },
  ]);

  return (
    <html lang="ko">
      <head>
        {/* Pretendard: CDN CSS를 인라인화 + font-display:optional로 변환 */}
        {pretendardCss && (
          // eslint-disable-next-line @eslint-react/dom/no-dangerously-set-innerhtml -- 서버에서 fetch한 CDN CSS를 font-display:optional로 변환하여 인라인. XSS 위험 없음 (고정 URL)
          <style dangerouslySetInnerHTML={{ __html: pretendardCss }} />
        )}
      </head>
      <body className="font-sans antialiased">
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
        {/* eslint-disable @eslint-react/dom/no-dangerously-set-innerhtml -- WebSite JSON-LD, 서버 생성 데이터로 XSS 위험 없음 */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(webSiteJsonLd).replace(/</g, "\\u003c"),
          }}
        />
        {/* eslint-enable @eslint-react/dom/no-dangerously-set-innerhtml */}
        {/* eslint-disable @eslint-react/dom/no-dangerously-set-innerhtml -- FAQPage JSON-LD, 서버 생성 정적 데이터로 XSS 위험 없음 */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(faqPageJsonLd).replace(/</g, "\\u003c"),
          }}
        />
        {/* eslint-enable @eslint-react/dom/no-dangerously-set-innerhtml */}
        {/* eslint-disable @eslint-react/dom/no-dangerously-set-innerhtml -- BreadcrumbList JSON-LD, 서버 생성 정적 데이터로 XSS 위험 없음 */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(breadcrumbListJsonLd).replace(
              /</g,
              "\\u003c",
            ),
          }}
        />
        {/* eslint-enable @eslint-react/dom/no-dangerously-set-innerhtml */}
        {children}
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
          strategy="afterInteractive"
        />
        <Script id="ga4-init" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_ID}');
          `}
        </Script>
        <Script id="ms-clarity" strategy="afterInteractive">
          {`
            (function(c,l,a,r,i,t,y){
              c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
              t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
              y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
            })(window,document,"clarity","script","${CLARITY_ID}");
          `}
        </Script>
      </body>
    </html>
  );
}
