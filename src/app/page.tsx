import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { Footer } from "@/components/Footer";
import { Hero } from "@/components/Hero";
import { MobilePhoneButton } from "@/components/MobilePhoneButton";
import { Navbar } from "@/components/Navbar";
import { getSiteConfig } from "@/shared/lib/site-config";
import {
  getPublishedReviews,
  getPublishedServicesWithImageUrls,
} from "@/shared/lib/home";

const Services = dynamic(() =>
  import("@/components/Services").then((mod) => ({ default: mod.Services })),
  { ssr: true },
);
const BlogReviews = dynamic(() =>
  import("@/components/BlogReviews").then((mod) => ({ default: mod.BlogReviews })),
  { ssr: true },
);
const ContactForm = dynamic(() =>
  import("@/components/ContactForm").then((mod) => ({ default: mod.ContactForm })),
  { ssr: true },
);

// ISR: 1시간마다 재검증
export const revalidate = 3600;

export const metadata: Metadata = {
  title: "청소클라쓰 — 전북 전주 전문 청소 서비스",
};

export default async function Home() {
  const [siteConfig, reviews, servicesWithImageUrls] = await Promise.all([
    getSiteConfig(),
    getPublishedReviews(),
    getPublishedServicesWithImageUrls(),
  ]);

  return (
    <main className="min-h-screen bg-white font-sans text-slate-900 selection:bg-slate-900 selection:text-white">
      <Navbar
        businessName={siteConfig?.business_name}
        blogUrl={siteConfig?.blog_url}
        instagramUrl={siteConfig?.instagram_url}
      />
      <Hero
        businessName={siteConfig?.business_name}
        phone={siteConfig?.phone}
        description={siteConfig?.description ?? undefined}
      />
      <Services
        services={servicesWithImageUrls}
        serviceDescription={siteConfig?.service_description ?? undefined}
      />
      <BlogReviews
        reviews={reviews}
        blogUrl={siteConfig?.blog_url ?? ""}
        instagramUrl={siteConfig?.instagram_url ?? ""}
        reviewDescription={siteConfig?.review_description ?? undefined}
      />
      <ContactForm phone={siteConfig?.phone} />
      <Footer siteConfig={siteConfig} />
      {siteConfig?.phone && <MobilePhoneButton phone={siteConfig.phone} />}
    </main>
  );
}
