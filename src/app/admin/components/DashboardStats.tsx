import { getAdminDashboardData } from "@/shared/lib/queries/admin";

export async function DashboardStats(): Promise<React.ReactElement> {
  const { serviceCount, reviewCount, faqCount } = await getAdminDashboardData();

  return (
    <div className="mb-12 grid grid-cols-1 gap-6 md:grid-cols-3">
      <div className="border border-slate-200 p-6">
        <p className="text-label mb-2 text-slate-500">전체 서비스 수</p>
        <p className="text-4xl font-black text-slate-900">{serviceCount}</p>
      </div>
      <div className="border border-slate-200 p-6">
        <p className="text-label mb-2 text-slate-500">전체 리뷰 수</p>
        <p className="text-4xl font-black text-slate-900">{reviewCount}</p>
      </div>
      <div className="border border-slate-200 p-6">
        <p className="text-label mb-2 text-slate-500">전체 FAQ 수</p>
        <p className="text-4xl font-black text-slate-900">{faqCount}</p>
      </div>
    </div>
  );
}
