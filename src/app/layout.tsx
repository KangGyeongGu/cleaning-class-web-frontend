import type { Metadata } from "next";
import "@/app/globals.css";
import { generateLocalBusinessJsonLd } from "@/shared/lib/json-ld";
import { createClient } from "@/shared/lib/supabase/server";

export const metadata: Metadata = {
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
        url: "https://www.cleaningclass.co.kr/og-image.png",
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
    images: ["https://www.cleaningclass.co.kr/og-image.png"],
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  let siteConfig = null;
  try {
    const supabase = await createClient();
    const { data, error: siteConfigError } = await supabase
      .from("site_config")
      .select("*")
      .single();
    if (siteConfigError) {
      console.error("[layout] site_config 쿼리 실패:", siteConfigError);
    }
    siteConfig = data;
  } catch (e) {
    console.error("[layout] createClient/query 예외:", e);
  }

  const jsonLd = generateLocalBusinessJsonLd(siteConfig);

  return (
    <html lang="ko">
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
