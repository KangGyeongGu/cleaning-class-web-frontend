// 관리자 대시보드 페이지 — GA4 + DB 데이터를 병렬 조회
import type { Metadata } from "next";

import { DashboardStats } from "@/app/admin/components/DashboardStats";
import { getAdminDashboardData } from "@/shared/lib/queries/admin";
import { getAnalyticsData } from "@/shared/lib/queries/analytics";
import AnalyticsDashboard from "@/app/admin/dashboard/AnalyticsDashboard.client";

export const metadata: Metadata = { title: "대시보드" };

/** 매 진입 시 항상 최신 데이터를 조회하도록 캐시 비활성화 */
export const dynamic = "force-dynamic";

/** 인증은 admin/layout.tsx에서 처리 */
export default async function DashboardPage(): Promise<React.ReactElement> {
  // GA4 데이터(9 API)와 DB 통계(3 쿼리)를 병렬로 조회
  const [analyticsData, dashboardData] = await Promise.all([
    getAnalyticsData(),
    getAdminDashboardData(),
  ]);

  return (
    <div className="p-6 md:p-10">
      <DashboardStats data={dashboardData} />
      <AnalyticsDashboard initialData={analyticsData} />
    </div>
  );
}
