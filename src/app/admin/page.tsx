/**
 * 관리자 대시보드 페이지 (composition-only)
 * 인증 확인 후 DashboardStats 및 관리 메뉴 링크를 조합합니다.
 */

import Link from "next/link";
import { HelpCircle, ImageIcon, Layers, Settings } from "lucide-react";
import { getUser } from "@/shared/lib/supabase/auth";
import { DashboardStats } from "@/app/admin/components/DashboardStats";

export default async function AdminDashboardPage(): Promise<React.ReactElement> {
  // 인증 확인: 미인증 시 getUser 내부에서 리다이렉트
  await getUser();

  return (
    <div className="mx-auto max-w-6xl p-8">
      <h1 className="mb-8 text-3xl font-black text-slate-900">대시보드</h1>

      {/* 통계 카드 — 데이터 페칭은 DashboardStats 서버 컴포넌트에서 처리 */}
      <DashboardStats />

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
            href="/admin/faq"
            className="group border border-slate-200 p-6 transition-colors hover:border-slate-900"
          >
            <div className="mb-2 flex items-center gap-3">
              <HelpCircle
                size={20}
                className="text-slate-500 transition-colors group-hover:text-slate-900"
              />
              <h3 className="text-lg font-bold text-slate-900">FAQ 관리</h3>
            </div>
            <p className="text-sm font-light text-slate-500">
              자주 묻는 질문을 등록, 수정, 삭제할 수 있습니다.
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
