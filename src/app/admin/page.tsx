import Link from "next/link";
import { createClient } from "@/shared/lib/supabase/server";
import { ImageIcon, Layers, Settings } from "lucide-react";

export default async function AdminDashboardPage() {
  const supabase = await createClient();

  // 전체 리뷰/서비스 수 카운트
  const [{ count: reviewCount }, { count: serviceCount }] = await Promise.all([
    supabase.from("reviews").select("*", { count: "exact", head: true }),
    supabase.from("services").select("*", { count: "exact", head: true }),
  ]);

  return (
    <div className="mx-auto max-w-6xl p-8">
      <h1 className="mb-8 text-3xl font-black text-slate-900">대시보드</h1>

      {/* 통계 카드 */}
      <div className="mb-12 grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="border border-slate-200 p-6">
          <p className="mb-2 text-xs font-bold tracking-widest text-slate-500 uppercase">
            전체 서비스 수
          </p>
          <p className="text-4xl font-black text-slate-900">
            {serviceCount ?? 0}
          </p>
        </div>
        <div className="border border-slate-200 p-6">
          <p className="mb-2 text-xs font-bold tracking-widest text-slate-500 uppercase">
            전체 리뷰 수
          </p>
          <p className="text-4xl font-black text-slate-900">
            {reviewCount ?? 0}
          </p>
        </div>
      </div>

      {/* 바로가기 링크 */}
      <div className="space-y-4">
        <h2 className="mb-4 text-xl font-black text-slate-900">관리 메뉴</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <Link
            href="/admin/services"
            className="group border border-slate-200 p-6 transition-colors hover:border-slate-900"
          >
            <div className="mb-2 flex items-center gap-3">
              <Layers
                size={20}
                className="text-slate-500 transition-colors group-hover:text-slate-900"
              />
              <h3 className="text-lg font-bold text-slate-900">서비스 관리</h3>
            </div>
            <p className="text-sm font-light text-slate-500">
              서비스를 등록, 수정, 삭제할 수 있습니다.
            </p>
          </Link>

          <Link
            href="/admin/reviews"
            className="group border border-slate-200 p-6 transition-colors hover:border-slate-900"
          >
            <div className="mb-2 flex items-center gap-3">
              <ImageIcon
                size={20}
                className="text-slate-500 transition-colors group-hover:text-slate-900"
              />
              <h3 className="text-lg font-bold text-slate-900">리뷰 관리</h3>
            </div>
            <p className="text-sm font-light text-slate-500">
              리뷰를 등록, 수정, 삭제할 수 있습니다.
            </p>
          </Link>

          <Link
            href="/admin/config"
            className="group border border-slate-200 p-6 transition-colors hover:border-slate-900"
          >
            <div className="mb-2 flex items-center gap-3">
              <Settings
                size={20}
                className="text-slate-500 transition-colors group-hover:text-slate-900"
              />
              <h3 className="text-lg font-bold text-slate-900">업체 정보</h3>
            </div>
            <p className="text-sm font-light text-slate-500">
              업체명, 연락처, 소셜미디어 등을 설정할 수 있습니다.
            </p>
          </Link>
        </div>
      </div>
    </div>
  );
}
