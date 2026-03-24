import type { MetadataRoute } from "next";
import { createClient } from "@/shared/lib/supabase/server";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = await createClient();

  // 서비스, 리뷰, 사이트 설정 중 가장 최근 업데이트 시점을 조회
  const [{ data: serviceData }, { data: reviewData }, { data: configData }] =
    await Promise.all([
      supabase
        .from("services")
        .select("updated_at")
        .order("updated_at", { ascending: false })
        .limit(1)
        .single(),
      supabase
        .from("reviews")
        .select("updated_at")
        .order("updated_at", { ascending: false })
        .limit(1)
        .single(),
      supabase.from("site_config").select("updated_at").limit(1).single(),
    ]);

  const dates = [
    serviceData?.updated_at,
    reviewData?.updated_at,
    configData?.updated_at,
  ]
    .filter(Boolean)
    .map((d) => new Date(d as string));

  const lastModified =
    dates.length > 0
      ? new Date(Math.max(...dates.map((d) => d.getTime())))
      : new Date();

  return [
    {
      url: "https://www.cleaningclass.co.kr",
      lastModified,
      changeFrequency: "weekly",
      priority: 1.0,
    },
  ];
}
