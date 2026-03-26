// policy 하위 라우트 공통 레이아웃 — Navbar/Footer를 한 번만 선언하여 공유
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { getSiteConfig } from "@/shared/lib/site-config";

export default async function PolicyLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const siteConfig = await getSiteConfig();

  return (
    <>
      <Navbar
        businessName={siteConfig?.business_name}
        blogUrl={siteConfig?.blog_url}
        instagramUrl={siteConfig?.instagram_url}
      />
      <main className="min-h-screen bg-white font-sans text-slate-900 selection:bg-slate-900 selection:text-white">
        {children}
      </main>
      <Footer siteConfig={siteConfig} />
    </>
  );
}
