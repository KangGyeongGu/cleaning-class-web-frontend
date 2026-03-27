import { getPublishedReviews } from "@/shared/lib/home";
import { getSiteConfig } from "@/shared/lib/site-config";
import { BlogReviews } from "@/components/BlogReviews";

export async function BlogReviewsSection() {
  // 리뷰 목록과 사이트 설정을 병렬 조회 (React cache()로 getSiteConfig 중복 요청 방지)
  const [reviews, siteConfig] = await Promise.all([
    getPublishedReviews(),
    getSiteConfig(),
  ]);

  return (
    <BlogReviews
      reviews={reviews}
      blogUrl={siteConfig?.blog_url ?? ""}
      instagramUrl={siteConfig?.instagram_url ?? ""}
      reviewDescription={siteConfig?.review_description ?? undefined}
    />
  );
}
