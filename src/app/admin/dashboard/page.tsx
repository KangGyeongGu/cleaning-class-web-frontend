// 관리자 대시보드 페이지 — 진입 시 GA4 데이터 최신 조회
import type { Metadata } from "next";

import { DashboardStats } from "@/app/admin/components/DashboardStats";
import { getAnalyticsData } from "@/shared/lib/queries/analytics";
import { getUser } from "@/shared/lib/supabase/auth";
import AnalyticsDashboard from "@/app/admin/dashboard/AnalyticsDashboard.client";

export const metadata: Metadata = { title: "대시보드" };

/** 매 진입 시 항상 최신 데이터를 조회하도록 캐시 비활성화 */
export const dynamic = "force-dynamic";

export default async function DashboardPage(): Promise<React.ReactElement> {
  await getUser();

  // 진입 시 전체 GA4 데이터 최신 조회 (캐시 없음)
  const analyticsData = await getAnalyticsData();

  return (
    <div className="p-6 md:p-10">
      <DashboardStats />
      <AnalyticsDashboard initialData={analyticsData} />
    </div>
  );
}
