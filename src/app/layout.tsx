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
    "전주 청소·이사업체 청소클라쓰 — 전북 전주 거주청소, 입주청소, 정기청소, 이사청소, 특수청소, 상가청소 전문",
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
    "전주 이사",
    "전북 이사업체",
    "이사청소",
    "청소클라쓰",
  ],
  openGraph: {
    type: "website",
    locale: "ko_KR",
    url: "https://www.cleaningclass.co.kr",
    siteName: "청소클라쓰",
    title: "청소클라쓰",
    description:
      "전주 청소·이사업체 청소클라쓰 — 거주청소, 입주청소, 정기청소, 이사청소, 특수청소, 상가청소",
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
  const siteConfig = await getSiteConfig();
  const jsonLd = generateLocalBusinessJsonLd(siteConfig);
  const webSiteJsonLd = generateWebSiteJsonLd(siteConfig);
  const breadcrumbListJsonLd = generateBreadcrumbListJsonLd([
    { name: "홈", url: "https://www.cleaningclass.co.kr" },
  ]);

  return (
    <html lang="ko">
      <head>
        {/* eslint-disable-next-line @next/next/no-css-tags -- public 셀프 호스팅 폰트, CSS 모듈 import 불가 */}
        <link rel="stylesheet" href="/fonts/pretendard/pretendard.css" />
      </head>
      <body className="font-sans antialiased">
        {/* eslint-disable @eslint-react/dom/no-dangerously-set-innerhtml -- JSON-LD 구조화 데이터, < → \u003c 치환으로 XSS 방어 적용 */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(webSiteJsonLd).replace(/</g, "\\u003c"),
          }}
        />
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
