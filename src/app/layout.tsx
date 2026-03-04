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
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createClient();
  const { data: siteConfig } = await supabase
    .from('site_config')
    .select('*')
    .single();

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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {children}
      </body>
    </html>
  );
}
