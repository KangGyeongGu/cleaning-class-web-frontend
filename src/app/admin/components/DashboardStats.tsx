import type { AdminDashboardData } from "@/shared/lib/queries/admin";

interface DashboardStatsProps {
  data: AdminDashboardData;
}

export function DashboardStats({ data }: DashboardStatsProps): React.ReactElement {
  return (
    <div className="mb-12 grid grid-cols-1 gap-6 md:grid-cols-3">
      <div className="border border-slate-200 p-6">
        <p className="text-label mb-2 text-slate-500">전체 서비스 수</p>
        <p className="text-4xl font-black text-slate-900">{data.serviceCount}</p>
      </div>
      <div className="border border-slate-200 p-6">
        <p className="text-label mb-2 text-slate-500">전체 리뷰 수</p>
        <p className="text-4xl font-black text-slate-900">{data.reviewCount}</p>
      </div>
      <div className="border border-slate-200 p-6">
        <p className="text-label mb-2 text-slate-500">전체 FAQ 수</p>
        <p className="text-4xl font-black text-slate-900">{data.faqCount}</p>
      </div>
    </div>
  );
}
