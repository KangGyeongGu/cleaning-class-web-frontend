import Link from "next/link";
import { Plus } from "lucide-react";
import { getReviews } from "@/shared/lib/queries/review";
import { getSiteConfig } from "@/shared/lib/site-config";
import { ReviewListClient } from "@/app/admin/reviews/ReviewListClient";
import { InlineDescriptionEditor } from "@/app/admin/components/InlineDescriptionEditor";
import { updateReviewDescription } from "@/shared/actions/site-config";

export default async function ReviewsPage() {
  const [reviewsWithImageUrls, siteConfig] = await Promise.all([
    getReviews(),
    getSiteConfig(),
  ]);

  return (
    <div className="mx-auto max-w-7xl p-8">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-3xl font-black text-slate-900">리뷰 관리</h1>
        <Link
          href="/admin/reviews/new"
          className="flex items-center gap-2 bg-slate-900 px-6 py-3 text-sm font-bold tracking-widest text-white transition-colors hover:bg-slate-800"
        >
          <Plus size={18} />
          신규 등록
        </Link>
      </div>

      <InlineDescriptionEditor
        initialValue={siteConfig?.review_description ?? ""}
        placeholder="리뷰 섹션 안내 문구를 입력하세요"
        emptyText="리뷰 섹션 안내 문구가 없습니다."
        onSave={updateReviewDescription}
      />

      {reviewsWithImageUrls.length === 0 ? (
        <div className="border border-slate-200 p-12 text-center">
          <p className="font-light text-slate-500">등록된 리뷰가 없습니다.</p>
        </div>
      ) : (
        <ReviewListClient reviews={reviewsWithImageUrls} />
      )}
    </div>
  );
}
