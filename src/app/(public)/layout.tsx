import { Footer } from "@/components/Footer";
import { Navbar } from "@/components/Navbar";
import { MobilePhoneButton } from "@/components/MobilePhoneButton";
import { getSiteConfig } from "@/shared/lib/site-config";

interface PublicLayoutProps {
  children: React.ReactNode;
}

export default async function PublicLayout({ children }: PublicLayoutProps) {
  const siteConfig = await getSiteConfig();

  return (
    <>
      <Navbar
        businessName={siteConfig?.business_name}
        blogUrl={siteConfig?.blog_url}
        instagramUrl={siteConfig?.instagram_url}
        daangnUrl={siteConfig?.daangn_url}
      />
      <main>{children}</main>
      <Footer siteConfig={siteConfig} />
      {siteConfig?.phone && <MobilePhoneButton phone={siteConfig.phone} />}
    </>
  );
}
