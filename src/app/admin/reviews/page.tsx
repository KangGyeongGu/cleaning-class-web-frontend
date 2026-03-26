/**
 * 리뷰 관리 페이지 (composition-only)
 * 인증 확인 후 섹션 서버 컴포넌트들을 조합합니다.
 */

import Link from "next/link";
import { Plus } from "lucide-react";
import { getUser } from "@/shared/lib/supabase/auth";
import { ReviewDescriptionSection } from "@/app/admin/reviews/ReviewDescriptionSection";
import { ReviewListSection } from "@/app/admin/reviews/ReviewListSection";

export default async function ReviewsPage(): Promise<React.ReactElement> {
  // 인증 확인: 미인증 시 getUser 내부에서 리다이렉트
  await getUser();

  return (
    <div className="mx-auto max-w-7xl p-8">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-3xl font-black text-slate-900">리뷰 관리</h1>
        <Link
          href="/admin/reviews/new"
          className="flex items-center gap-2 bg-slate-900 px-6 py-3 text-sm font-bold tracking-widest text-white transition-colors hover:bg-slate-800"
        >
          <Plus size={18} />
          신규 등록
        </Link>
      </div>

      {/* 안내 문구 편집기 — site_config 조회는 ReviewDescriptionSection에서 처리 */}
      <ReviewDescriptionSection />

      {/* 리뷰 목록 — 데이터 조회는 ReviewListSection에서 처리 */}
      <ReviewListSection />
    </div>
  );
}
