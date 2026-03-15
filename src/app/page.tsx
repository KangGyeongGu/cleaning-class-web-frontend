import { BlogReviews } from "@/components/BlogReviews";
import { ContactForm } from "@/components/ContactForm";
import { Footer } from "@/components/Footer";
import { Hero } from "@/components/Hero";
import { MobilePhoneButton } from "@/components/MobilePhoneButton";
import { Navbar } from "@/components/Navbar";
import { Services } from "@/components/Services";
import { createClient } from "@/shared/lib/supabase/server";
import { getServiceImageUrl } from "@/shared/lib/supabase/storage";
import type { SiteConfig, Review, Service } from "@/shared/types/database";

// ISR: 1시간마다 재검증
export const revalidate = 3600;

export default async function Home() {
  const supabase = await createClient();

  // 병렬 데이터 페칭
  const [siteConfigResult, reviewsResult, servicesResult] = await Promise.all([
    supabase.from("site_config").select("*").single(),
    supabase
      .from("reviews")
      .select("*")
      .eq("is_published", true)
      .order("sort_order", { ascending: true }),
    supabase
      .from("services")
      .select("*")
      .eq("is_published", true)
      .order("sort_order", { ascending: true }),
  ]);

  if (siteConfigResult.error) {
    console.error("[page] site_config fetch error:", siteConfigResult.error);
  }
  if (reviewsResult.error) {
    console.error("[page] reviews fetch error:", reviewsResult.error);
  }
  if (servicesResult.error) {
    console.error("[page] services fetch error:", servicesResult.error);
  }

  const siteConfig = siteConfigResult.data as SiteConfig | null;
  const reviews = (reviewsResult.data as Review[] | null) ?? [];
  const services = (servicesResult.data as Service[] | null) ?? [];

  const servicesWithImageUrls = services.map((s) => ({
    id: s.id,
    title: s.title,
    description: s.description,
    imageUrl: getServiceImageUrl(s.image_path),
    afterImageUrl: s.image_after_path
      ? getServiceImageUrl(s.image_after_path)
      : undefined,
    focalX: s.image_focal_x,
    focalY: s.image_focal_y,
    afterFocalX: s.image_after_focal_x,
    afterFocalY: s.image_after_focal_y,
  }));

  return (
    <main className="min-h-screen bg-white font-sans text-slate-900 selection:bg-slate-900 selection:text-white">
      <Navbar businessName={siteConfig?.business_name} />
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
