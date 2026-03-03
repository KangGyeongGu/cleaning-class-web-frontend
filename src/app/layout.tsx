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
      <body className="antialiased">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {children}
      </body>
    </html>
  );
}
