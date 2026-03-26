/**
 * 리뷰 목록 섹션 서버 컴포넌트
 * 리뷰 데이터를 조회하여 ReviewListClient에 전달합니다.
 */

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
