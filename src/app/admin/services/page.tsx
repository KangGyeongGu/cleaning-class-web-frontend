import Link from "next/link";
import { Plus } from "lucide-react";
import { getUser } from "@/shared/lib/supabase/auth";
import { ServiceDescriptionSection } from "@/app/admin/services/ServiceDescriptionSection";
import { ServiceListSection } from "@/app/admin/services/ServiceListSection";

export default async function ServicesPage(): Promise<React.ReactElement> {
  await getUser();

  return (
    <div className="mx-auto max-w-7xl p-8">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-3xl font-black text-slate-900">서비스 관리</h1>
        <Link
          href="/admin/services/new"
          className="flex items-center gap-2 bg-slate-900 px-6 py-3 text-sm font-bold tracking-widest text-white transition-colors hover:bg-slate-800"
        >
          <Plus size={18} />
          신규 등록
        </Link>
      </div>

      <ServiceDescriptionSection />
      <ServiceListSection />
    </div>
  );
}
