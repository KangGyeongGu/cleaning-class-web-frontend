import { getReviews } from "@/shared/lib/queries/review";
import { ReviewListClient } from "@/app/admin/reviews/ReviewListClient";

export async function ReviewListSection(): Promise<React.ReactElement> {
  const reviewsWithImageUrls = await getReviews();

  if (reviewsWithImageUrls.length === 0) {
    return (
      <div className="border border-slate-200 p-12 text-center">
        <p className="font-light text-slate-500">등록된 리뷰가 없습니다.</p>
      </div>
    );
  }

  return <ReviewListClient reviews={reviewsWithImageUrls} />;
}
