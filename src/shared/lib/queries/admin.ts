import { createClient } from "@/shared/lib/supabase/server";

export interface AdminDashboardData {
  serviceCount: number;
  reviewCount: number;
  faqCount: number;
}

export async function getAdminDashboardData(): Promise<AdminDashboardData> {
  const supabase = await createClient();

  const [serviceResult, reviewResult, faqResult] = await Promise.all([
    supabase.from("services").select("*", { count: "exact", head: true }),
    supabase.from("reviews").select("*", { count: "exact", head: true }),
    supabase.from("faqs").select("*", { count: "exact", head: true }),
  ]);

  if (serviceResult.error) {
    console.error(
      "[getAdminDashboardData] 서비스 카운트 조회 실패:",
      serviceResult.error,
    );
  }

  if (reviewResult.error) {
    console.error(
      "[getAdminDashboardData] 리뷰 카운트 조회 실패:",
      reviewResult.error,
    );
  }

  if (faqResult.error) {
    console.error(
      "[getAdminDashboardData] FAQ 카운트 조회 실패:",
      faqResult.error,
    );
  }

  return {
    serviceCount: serviceResult.count ?? 0,
    reviewCount: reviewResult.count ?? 0,
    faqCount: faqResult.count ?? 0,
  };
}
