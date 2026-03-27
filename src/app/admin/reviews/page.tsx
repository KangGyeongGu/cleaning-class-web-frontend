import Link from "next/link";
import { Plus } from "lucide-react";
import { getUser } from "@/shared/lib/supabase/auth";
import { ReviewDescriptionSection } from "@/app/admin/reviews/ReviewDescriptionSection";
import { ReviewListSection } from "@/app/admin/reviews/ReviewListSection";

export default async function ReviewsPage(): Promise<React.ReactElement> {
  await getUser();

  return (
    <div className="mx-auto max-w-7xl p-8">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-heading-1">리뷰 관리</h1>
        <Link
          href="/admin/reviews/new"
          className="btn-primary flex items-center gap-2 px-6 py-3"
        >
          <Plus size={18} />
          신규 등록
        </Link>
      </div>

      <ReviewDescriptionSection />
      <ReviewListSection />
    </div>
  );
}
