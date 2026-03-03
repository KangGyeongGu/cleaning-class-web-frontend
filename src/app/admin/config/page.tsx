import { createClient } from '@/shared/lib/supabase/server';
import { SiteConfigForm } from '@/app/admin/config/SiteConfigForm';

export default async function SiteConfigPage() {
  const supabase = await createClient();

  // site_config 조회 (id=1 고정)
  const { data: config, error } = await supabase
    .from('site_config')
    .select('*')
    .eq('id', 1)
    .single();

  if (error || !config) {
    return (
      <div className="p-8 max-w-4xl mx-auto">
        <h1 className="text-3xl font-black text-slate-900 mb-8">업체 정보</h1>
        <div className="border border-slate-200 p-12 text-center">
          <p className="text-slate-500 font-light">업체 정보를 불러올 수 없습니다.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-black text-slate-900 mb-8">업체 정보</h1>
      <SiteConfigForm config={config} />
    </div>
  );
}
