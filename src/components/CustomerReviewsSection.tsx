// 고객 리뷰 섹션 — 서버 컴포넌트, 별점 + 텍스트 리뷰 목록 표시
// TASK-LOGIC-004 완료 후 getCustomerReviews 함수를 @/shared/lib/home에서 import로 교체 예정
// 현재는 직접 DB 조회하여 의존 미완성 상태에서도 빌드 가능하게 처리

import { createStaticClient } from "@/shared/lib/supabase/static";
import { StarRating } from "@/components/StarRating";
import { CustomerReviewsReveal } from "@/components/CustomerReviewsReveal.client";

// TASK-LOGIC-001 완료 전 임시 타입 정의 — 이후 @/shared/types/database 에서 import로 교체
interface CustomerReviewRow {
  id: string;
  rating: number;
  comment: string;
  created_at: string;
}

// 고객 리뷰 조회 — ISR 호환 정적 클라이언트 사용
async function getCustomerReviews(): Promise<CustomerReviewRow[]> {
  try {
    const supabase = createStaticClient();
    // customer_reviews 테이블은 TASK-LOGIC-001 마이그레이션 완료 후 활성화됨
    // 테이블 미존재 시 빈 배열 반환하여 페이지 렌더링 유지
    const { data, error } = await supabase
      .from("customer_reviews" as Parameters<typeof supabase.from>[0])
      .select("id, rating, comment, created_at")
      .order("created_at", { ascending: false });

    if (error) {
      // 테이블 미존재(42P01) 에러는 조용히 처리 — DB 마이그레이션 전 예상 상황
      console.info("[getCustomerReviews] DB query skipped:", error.message);
      return [];
    }

    return (data as CustomerReviewRow[] | null) ?? [];
  } catch (err) {
    console.error("[getCustomerReviews] Unexpected error:", err);
    return [];
  }
}

// 작성 날짜를 상대적 표현으로 변환 (예: "3일 전", "2개월 전")
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

// 개별 리뷰 카드 — 장식 없이 텍스트와 별점으로만 구성
function ReviewCard({ review }: ReviewCardProps): React.ReactElement {
  return (
    <article className="border-b border-slate-100 py-8 last:border-b-0">
      <div className="mb-3 flex items-center justify-between">
        <StarRating rating={review.rating} size={15} />
        <span className="text-caption text-slate-400">
          {formatRelativeDate(review.created_at)}
        </span>
      </div>

      <p className="text-body leading-relaxed text-slate-700">{review.comment}</p>

      <p className="mt-3 text-xs font-medium tracking-widest text-slate-400 uppercase">
        고객
      </p>
    </article>
  );
}

export async function CustomerReviewsSection(): Promise<React.ReactElement | null> {
  const reviews = await getCustomerReviews();

  // 리뷰가 없을 경우 섹션 자체를 렌더링하지 않음 — 빈 상태 노출 방지
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
        {/* 섹션 헤더 */}
        <div className="mb-12">
          <h2
            id="customer-reviews-heading"
            className="text-heading-1 mb-4"
          >
            고객 리뷰
          </h2>
          <p className="text-body-sm tracking-wide text-slate-500 md:text-base">
            실제 의뢰인들의 솔직한 사용 후기입니다.
          </p>
        </div>

        {/* 스크롤 진입 애니메이션 래퍼 */}
        <CustomerReviewsReveal>
          {reviews.map((review) => (
            <ReviewCard key={review.id} review={review} />
          ))}
        </CustomerReviewsReveal>
      </div>
    </section>
  );
}
