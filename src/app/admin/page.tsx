import Link from 'next/link';
import { createClient } from '@/shared/lib/supabase/server';
import { ImageIcon, Layers, Settings } from 'lucide-react';

export default async function AdminDashboardPage() {
  const supabase = await createClient();

  // 전체 리뷰/서비스 수 카운트
  const [{ count: reviewCount }, { count: serviceCount }] = await Promise.all([
    supabase.from('reviews').select('*', { count: 'exact', head: true }),
    supabase.from('services').select('*', { count: 'exact', head: true }),
  ]);

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-3xl font-black text-slate-900 mb-8">대시보드</h1>

      {/* 통계 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="border border-slate-200 p-6">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">전체 서비스 수</p>
          <p className="text-4xl font-black text-slate-900">{serviceCount ?? 0}</p>
        </div>
        <div className="border border-slate-200 p-6">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">전체 리뷰 수</p>
          <p className="text-4xl font-black text-slate-900">{reviewCount ?? 0}</p>
        </div>
      </div>

      {/* 바로가기 링크 */}
      <div className="space-y-4">
        <h2 className="text-xl font-black text-slate-900 mb-4">관리 메뉴</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            href="/admin/services"
            className="border border-slate-200 p-6 hover:border-slate-900 transition-colors group"
          >
            <div className="flex items-center gap-3 mb-2">
              <Layers size={20} className="text-slate-500 group-hover:text-slate-900 transition-colors" />
              <h3 className="text-lg font-bold text-slate-900">서비스 관리</h3>
            </div>
            <p className="text-sm text-slate-500 font-light">서비스를 등록, 수정, 삭제할 수 있습니다.</p>
          </Link>

          <Link
            href="/admin/reviews"
            className="border border-slate-200 p-6 hover:border-slate-900 transition-colors group"
          >
            <div className="flex items-center gap-3 mb-2">
              <ImageIcon size={20} className="text-slate-500 group-hover:text-slate-900 transition-colors" />
              <h3 className="text-lg font-bold text-slate-900">리뷰 관리</h3>
            </div>
            <p className="text-sm text-slate-500 font-light">리뷰를 등록, 수정, 삭제할 수 있습니다.</p>
          </Link>

          <Link
            href="/admin/config"
            className="border border-slate-200 p-6 hover:border-slate-900 transition-colors group"
          >
            <div className="flex items-center gap-3 mb-2">
              <Settings size={20} className="text-slate-500 group-hover:text-slate-900 transition-colors" />
              <h3 className="text-lg font-bold text-slate-900">업체 정보</h3>
            </div>
            <p className="text-sm text-slate-500 font-light">업체명, 연락처, 소셜미디어 등을 설정할 수 있습니다.</p>
          </Link>
        </div>
      </div>
    </div>
  );
}
