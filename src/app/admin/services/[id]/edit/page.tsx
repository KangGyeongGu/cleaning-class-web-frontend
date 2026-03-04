import { createClient } from '@/shared/lib/supabase/server';
import { getServiceImageUrl } from '@/shared/lib/supabase/storage';
import { notFound } from 'next/navigation';
import { EditServiceForm } from '@/app/admin/services/[id]/edit/EditServiceForm';
import type { Service } from '@/shared/types/database';

interface EditServicePageProps {
  params: Promise<{ id: string }>;
}

export default async function EditServicePage({ params }: EditServicePageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: service, error } = await supabase
    .from('services')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !service) {
    notFound();
  }

  const typedService = service as Service;
  const imageUrl = getServiceImageUrl(typedService.image_path);
  const afterImageUrl = typedService.image_after_path
    ? getServiceImageUrl(typedService.image_after_path)
    : undefined;

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-black text-slate-900 mb-8">서비스 수정</h1>
      <EditServiceForm service={typedService} imageUrl={imageUrl} afterImageUrl={afterImageUrl} />
    </div>
  );
}
