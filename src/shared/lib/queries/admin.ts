/**
 * 관리자 대시보드 전용 Supabase 쿼리 헬퍼
 * 여러 테이블의 집계 데이터를 한 번에 조회합니다.
 */

import { createClient } from "@/shared/lib/supabase/server";

/** 관리자 대시보드 통계 데이터 */
export interface AdminDashboardData {
  serviceCount: number;
  reviewCount: number;
  faqCount: number;
}

/**
 * 관리자 대시보드용 집계 데이터 조회
 * 서비스 수, 리뷰 수, FAQ 수를 병렬로 조회합니다.
 */
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
