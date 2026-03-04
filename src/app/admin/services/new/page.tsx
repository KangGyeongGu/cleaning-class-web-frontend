import { NewServiceForm } from '@/app/admin/services/new/NewServiceForm';

export default function NewServicePage() {
  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-black text-slate-900 mb-8">서비스 신규 등록</h1>
      <NewServiceForm />
    </div>
  );
}
