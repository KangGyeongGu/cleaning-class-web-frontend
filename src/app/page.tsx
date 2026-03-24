import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { Footer } from "@/components/Footer";
import { Hero } from "@/components/Hero";
import { MobilePhoneButton } from "@/components/MobilePhoneButton";
import { Navbar } from "@/components/Navbar";
import { getSiteConfig } from "@/shared/lib/site-config";
import type { SiteConfig } from "@/shared/types/database";
import {
  getPublishedReviews,
  getPublishedServicesWithImageUrls,
} from "@/shared/lib/home";
import { generateServiceJsonLd } from "@/shared/lib/json-ld";

const Services = dynamic(
  () =>
    import("@/components/Services").then((mod) => ({ default: mod.Services })),
  {
    ssr: true,
    loading: () => (
      <div className="py-16 md:py-32">
        <div className="mx-auto max-w-7xl animate-pulse px-6">
          <div className="mx-auto mb-8 h-8 w-48 rounded bg-slate-200" />
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <div className="h-64 rounded bg-slate-200" />
            <div className="h-64 rounded bg-slate-200" />
            <div className="h-64 rounded bg-slate-200" />
          </div>
        </div>
      </div>
    ),
  },
);
// BlogReviews, ContactForm: 'use client' 컴포넌트이므로 ssr: false는
// Client Component 경계 안에서만 허용됩니다 (Next.js 16 Turbopack 제약).
// loading skeleton으로 hydration 전 placeholder를 제공합니다.
const BlogReviews = dynamic(
  () =>
    import("@/components/BlogReviews").then((mod) => ({
      default: mod.BlogReviews,
    })),
  {
    loading: () => (
      <div className="py-16 md:py-32">
        <div className="mx-auto max-w-7xl animate-pulse px-6">
          <div className="mx-auto mb-8 h-8 w-48 rounded bg-slate-200" />
          <div className="h-64 rounded bg-slate-200" />
        </div>
      </div>
    ),
  },
);
const ContactForm = dynamic(
  () =>
    import("@/components/ContactForm").then((mod) => ({
      default: mod.ContactForm,
    })),
  {
    loading: () => (
      <div className="py-16 md:py-32">
        <div className="mx-auto max-w-7xl animate-pulse px-6">
          <div className="mx-auto mb-8 h-8 w-48 rounded bg-slate-200" />
          <div className="mb-4 h-12 rounded bg-slate-200" />
          <div className="mb-4 h-12 rounded bg-slate-200" />
          <div className="mb-4 h-32 rounded bg-slate-200" />
          <div className="h-12 w-32 rounded bg-slate-200" />
        </div>
      </div>
    ),
  },
);

// ISR: 1시간마다 재검증
export const revalidate = 3600;

function buildDescription(siteConfig?: SiteConfig | null): string {
  const phone = siteConfig?.phone ?? "010-6711-2964";
  return `${phone} · 연중무휴 · 전주 청소업체 청소클라쓰 · 거주청소 · 입주청소 · 정기청소 · 특수청소 · 쓰레기집청소 · 상가청소`;
}

export async function generateMetadata(): Promise<Metadata> {
  const siteConfig = await getSiteConfig();
  return {
    title: {
      absolute: "전주 청소업체 청소클라쓰 | 전북 전주 전문 청소 서비스",
    },
    description: buildDescription(siteConfig),
  };
}

export default async function Home() {
  const [siteConfig, reviews, servicesWithImageUrls] = await Promise.all([
    getSiteConfig(),
    getPublishedReviews(),
    getPublishedServicesWithImageUrls(),
  ]);

  const serviceJsonLd = generateServiceJsonLd(
    servicesWithImageUrls,
    siteConfig?.business_name,
  );

  return (
    <main className="min-h-screen bg-white font-sans text-slate-900 selection:bg-slate-900 selection:text-white">
      {/* eslint-disable @eslint-react/dom/no-dangerously-set-innerhtml -- Service JSON-LD, 서버 생성 DB 데이터로 XSS 위험 없음 */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(serviceJsonLd).replace(/</g, "\\u003c"),
        }}
      />
      {/* eslint-enable @eslint-react/dom/no-dangerously-set-innerhtml */}
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
