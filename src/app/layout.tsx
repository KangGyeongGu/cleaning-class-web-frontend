import type { Metadata, Viewport } from "next";
import Script from "next/script";
import "@/app/globals.css";
import {
  generateBreadcrumbListJsonLd,
  generateLocalBusinessJsonLd,
  generateWebSiteJsonLd,
} from "@/shared/lib/json-ld";
import { getSiteConfig } from "@/shared/lib/site-config";

// 스크립트 인젝션 방지: 영숫자와 하이픈만 허용
const ANALYTICS_ID_PATTERN = /^[A-Za-z0-9-]+$/;
const GA_ID = ANALYTICS_ID_PATTERN.test(process.env.NEXT_PUBLIC_GA_ID ?? "")
  ? (process.env.NEXT_PUBLIC_GA_ID ?? "")
  : "";
const CLARITY_ID = ANALYTICS_ID_PATTERN.test(
  process.env.NEXT_PUBLIC_CLARITY_ID ?? "",
)
  ? (process.env.NEXT_PUBLIC_CLARITY_ID ?? "")
  : "";

const PRETENDARD_CSS_URL =
  "https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css";

/**
 * Pretendard CDN CSS를 fetch하여 인라인 삽입.
 * - font-display: swap 유지 → 첫 방문에서도 폰트 교체 보장 (1회성 방문 서비스 특성)
 * - ISR(revalidate=86400)로 캐시되므로 매 요청마다 fetch하지 않음
 * - 인라인 <style>로 삽입하여 외부 CSS 요청 및 render-blocking 완전 제거
 */
async function getPretendardCss(): Promise<string> {
  try {
    const res = await fetch(PRETENDARD_CSS_URL, {
      next: { revalidate: 86400 },
    });
    if (!res.ok) return "";
    // Content-Type이 text/css가 아닌 경우 오염된 응답으로 간주하여 인라인 거부
    const contentType = res.headers.get("content-type");
    if (!contentType || !contentType.includes("text/css")) return "";
    let css = await res.text();
    // 상대 경로를 CDN 절대 경로로 변환 (인라인 시 서버 도메인 기준 해석 방지)
    const cdnBase =
      "https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/packages/pretendard/dist/web/variable/";
    css = css.replace(
      /url\(\.\.\/\.\.\/\.\.\/packages\/pretendard\/dist\/web\/variable\//g,
      `url(${cdnBase}`,
    );
    // </style> 및 <!-- 시퀀스 이스케이프: CDN 응답이 style 태그 탈출이나 HTML 주석 주입을 시도하는 경우 방어
    css = css.replace(/<\/style/gi, "<\\/style").replace(/<!--/g, "<\\!--");
    return css;
  } catch {
    return "";
  }
}

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
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "청소클라쓰",
  },
  alternates: {
    canonical: "https://www.cleaningclass.co.kr",
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
  const breadcrumbListJsonLd = generateBreadcrumbListJsonLd([
    { name: "홈", url: "https://www.cleaningclass.co.kr" },
  ]);

  return (
    <html lang="ko">
      <head>
        {pretendardCss && (
          // eslint-disable-next-line @eslint-react/dom/no-dangerously-set-innerhtml -- 서버에서 fetch한 CDN CSS를 인라인. XSS 위험 없음 (고정 URL, Content-Type 검증 완료)
          <style dangerouslySetInnerHTML={{ __html: pretendardCss }} />
        )}
      </head>
      <body className="font-sans antialiased">
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
        {GA_ID && (
          <>
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
          </>
        )}
        {CLARITY_ID && (
          <Script id="ms-clarity" strategy="afterInteractive">
            {`
            (function(c,l,a,r,i,t,y){
              c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
              t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
              y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
            })(window,document,"clarity","script","${CLARITY_ID}");
          `}
          </Script>
        )}
      </body>
    </html>
  );
}
