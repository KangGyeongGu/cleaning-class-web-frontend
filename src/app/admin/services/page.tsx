import Link from 'next/link';
import { createClient } from '@/shared/lib/supabase/server';
import { getServiceImageUrl } from '@/shared/lib/supabase/storage';
import { Plus } from 'lucide-react';
import { ServiceListClient } from '@/app/admin/services/ServiceListClient';
import { InlineDescriptionEditor } from '@/app/admin/components/InlineDescriptionEditor';
import { updateServiceDescription } from '@/shared/actions/site-config';
import type { Service, SiteConfig } from '@/shared/types/database';

export default async function ServicesPage() {
  const supabase = await createClient();

  const [servicesResult, configResult] = await Promise.all([
    supabase
      .from('services')
      .select('*')
      .order('sort_order', { ascending: true }),
    supabase
      .from('site_config')
      .select('*')
      .single(),
  ]);

  if (servicesResult.error) {
    console.error('서비스 목록 조회 실패:', servicesResult.error);
  }

  const siteConfig = configResult.data as SiteConfig | null;
  const servicesWithImageUrls = (servicesResult.data as Service[] ?? []).map((service) => ({
    ...service,
    imageUrl: getServiceImageUrl(service.image_path),
  }));

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-3xl font-black text-slate-900">서비스 관리</h1>
        <Link
          href="/admin/services/new"
          className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white font-bold text-sm tracking-widest hover:bg-slate-800 transition-colors"
        >
          <Plus size={18} />
          신규 등록
        </Link>
      </div>

      <InlineDescriptionEditor
        initialValue={siteConfig?.service_description ?? ''}
        placeholder="서비스 섹션 안내 문구를 입력하세요"
        emptyText="서비스 섹션 안내 문구가 없습니다."
        onSave={updateServiceDescription}
      />

      {servicesWithImageUrls.length === 0 ? (
        <div className="border border-slate-200 p-12 text-center">
          <p className="text-slate-500 font-light">등록된 서비스가 없습니다.</p>
        </div>
      ) : (
        <ServiceListClient services={servicesWithImageUrls as (Service & { imageUrl: string })[]} />
      )}
    </div>
  );
}
