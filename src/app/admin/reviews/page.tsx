import Link from "next/link";
import { Plus } from "lucide-react";
import { ReviewDescriptionSection } from "@/app/admin/reviews/ReviewDescriptionSection";
import { ReviewListSection } from "@/app/admin/reviews/ReviewListSection";

export default async function ReviewsPage(): Promise<React.ReactElement> {
  return (
    <div className="mx-auto max-w-7xl px-4 py-6 md:p-8">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-lg font-black md:text-heading-1">리뷰 관리</h1>
        <Link
          href="/admin/reviews/new"
          className="btn-primary flex shrink-0 items-center whitespace-nowrap gap-1.5 px-3 py-2 text-xs md:gap-2 md:px-6 md:py-3 md:text-sm"
        >
          <Plus size={16} className="md:h-[18px] md:w-[18px]" />
          신규 등록
        </Link>
      </div>

      <ReviewDescriptionSection />
      <ReviewListSection />
    </div>
  );
}
