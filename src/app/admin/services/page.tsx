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
        <h1 className="text-heading-1">서비스 관리</h1>
        <Link
          href="/admin/services/new"
          className="btn-primary flex items-center gap-2 px-6 py-3"
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
