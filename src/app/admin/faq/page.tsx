import Link from "next/link";
import { Plus } from "lucide-react";
import { FaqDescriptionSection } from "@/app/admin/faq/FaqDescriptionSection";
import { FaqListSection } from "@/app/admin/faq/FaqListSection";

export default async function FaqPage(): Promise<React.ReactElement> {
  return (
    <div className="mx-auto max-w-7xl p-8">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-heading-1">FAQ 관리</h1>
        <Link
          href="/admin/faq/new"
          className="btn-primary flex items-center gap-2 px-6 py-3"
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
