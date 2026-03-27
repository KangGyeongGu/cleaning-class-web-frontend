import type { MetadataRoute } from "next";
import { createClient } from "@/shared/lib/supabase/server";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = await createClient();

  // 서비스, 리뷰, 사이트 설정 중 가장 최근 업데이트 시점을 조회
  const [
    { data: serviceData, error: serviceError },
    { data: reviewData, error: reviewError },
    { data: configData, error: configError },
    { data: faqData, error: faqError },
  ] = await Promise.all([
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
    supabase
      .from("faqs")
      .select("updated_at")
      .order("updated_at", { ascending: false })
      .limit(1)
      .single(),
  ]);

  // PGRST116은 빈 테이블에서 .single() 호출 시 발생 — 정상 케이스이므로 무시
  if (serviceError && serviceError.code !== "PGRST116")
    console.error("[sitemap] services 조회 실패:", serviceError);
  if (reviewError && reviewError.code !== "PGRST116")
    console.error("[sitemap] reviews 조회 실패:", reviewError);
  if (configError && configError.code !== "PGRST116")
    console.error("[sitemap] site_config 조회 실패:", configError);
  if (faqError && faqError.code !== "PGRST116")
    console.error("[sitemap] faqs 조회 실패:", faqError);

  const dates = [
    serviceData?.updated_at,
    reviewData?.updated_at,
    configData?.updated_at,
    faqData?.updated_at,
  ]
    .filter((d): d is string => typeof d === "string")
    .map((d) => new Date(d));

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
    // 정책 페이지: 변경 빈도가 낮으므로 yearly, 낮은 우선순위 적용
    {
      url: "https://www.cleaningclass.co.kr/policy/privacy",
      lastModified: new Date("2026-03-23T00:00:00.000Z"),
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: "https://www.cleaningclass.co.kr/policy/terms",
      lastModified: new Date("2026-03-23T00:00:00.000Z"),
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: "https://www.cleaningclass.co.kr/help",
      lastModified: faqData?.updated_at
        ? new Date(faqData.updated_at as string)
        : new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
  ];
}
