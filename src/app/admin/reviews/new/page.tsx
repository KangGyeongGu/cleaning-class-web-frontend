import { getNextReviewSortOrder } from "@/shared/lib/queries/review";
import { NewReviewForm } from "@/app/admin/reviews/new/NewReviewForm.client";

export default async function NewReviewPage() {
  const nextSortOrder = await getNextReviewSortOrder();

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 md:p-8">
      <h1 className="mb-8 text-3xl font-black text-slate-900">
        리뷰 신규 등록
      </h1>
      <NewReviewForm defaultSortOrder={nextSortOrder} />
    </div>
  );
}
