import Link from "next/link";
import { Plus } from "lucide-react";
import { getUser } from "@/shared/lib/supabase/auth";
import { FaqDescriptionSection } from "@/app/admin/faq/FaqDescriptionSection";
import { FaqListSection } from "@/app/admin/faq/FaqListSection";

export default async function FaqPage(): Promise<React.ReactElement> {
  await getUser();

  return (
    <div className="mx-auto max-w-7xl p-8">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-3xl font-black text-slate-900">FAQ 관리</h1>
        <Link
          href="/admin/faq/new"
          className="flex items-center gap-2 bg-slate-900 px-6 py-3 text-sm font-bold tracking-widest text-white transition-colors hover:bg-slate-800"
        >
          <Plus size={18} />
          신규 등록
        </Link>
      </div>

      <FaqDescriptionSection />
      <FaqListSection />
    </div>
  );
}
