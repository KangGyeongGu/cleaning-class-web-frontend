import { getCustomerReviews } from "@/shared/lib/home";
import { StarRating } from "@/components/StarRating";
import { CustomerReviewsReveal } from "@/components/CustomerReviewsReveal.client";
import type { CustomerReviewRow } from "@/shared/types/database";

function formatRelativeDate(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays < 1) return "오늘";
  if (diffDays < 7) return `${diffDays}일 전`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}주 전`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)}개월 전`;
  return `${Math.floor(diffDays / 365)}년 전`;
}

interface ReviewCardProps {
  review: CustomerReviewRow;
}

function ReviewCard({ review }: ReviewCardProps): React.ReactElement {
  return (
    <article className="border-b border-slate-100 py-8 last:border-b-0">
      <div className="mb-3 flex items-center justify-between">
        <StarRating rating={review.rating} size={15} />
        <span className="text-caption text-slate-400">
          {formatRelativeDate(review.created_at)}
        </span>
      </div>

      <p className="text-body leading-relaxed text-slate-700">
        {review.comment}
      </p>

      <p className="mt-3 text-xs font-medium tracking-widest text-slate-400 uppercase">
        고객
      </p>
    </article>
  );
}

export async function CustomerReviewsSection(): Promise<React.ReactElement | null> {
  const reviews = await getCustomerReviews();

  if (reviews.length === 0) {
    return null;
  }

  return (
    <section
      id="customer-reviews"
      className="bg-white py-16 md:py-32"
      aria-labelledby="customer-reviews-heading"
    >
      <div className="container mx-auto max-w-2xl px-4 md:px-8 lg:px-12">
        <div className="mb-12">
          <h2 id="customer-reviews-heading" className="text-heading-1 mb-4">
            고객 리뷰
          </h2>
          <p className="text-body-sm tracking-wide text-slate-500 md:text-base">
            실제 의뢰인들의 솔직한 사용 후기입니다.
          </p>
        </div>

        <CustomerReviewsReveal>
          {reviews.map((review) => (
            <ReviewCard key={review.id} review={review} />
          ))}
        </CustomerReviewsReveal>
      </div>
    </section>
  );
}
