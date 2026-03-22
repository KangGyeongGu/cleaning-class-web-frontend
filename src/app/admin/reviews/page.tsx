import Link from "next/link";
import { createClient } from "@/shared/lib/supabase/server";
import { getReviewImageUrl } from "@/shared/lib/supabase/storage";
import { Plus } from "lucide-react";
import { ReviewListClient } from "@/app/admin/reviews/ReviewListClient";
import { InlineDescriptionEditor } from "@/app/admin/components/InlineDescriptionEditor";
import { updateReviewDescription } from "@/shared/actions/site-config";
import type { Review, SiteConfig } from "@/shared/types/database";

export default async function ReviewsPage() {
  const supabase = await createClient();

  const [reviewsResult, configResult] = await Promise.all([
    supabase
      .from("reviews")
      .select("*")
      .order("sort_order", { ascending: true }),
    supabase.from("site_config").select("*").single(),
  ]);

  if (reviewsResult.error) {
    console.error("리뷰 목록 조회 실패:", reviewsResult.error);
  }

  const siteConfig = configResult.data as SiteConfig | null;
  const reviewsWithImageUrls = ((reviewsResult.data as Review[]) ?? []).map(
    (review) => ({
      ...review,
      imageUrl: getReviewImageUrl(review.image_path),
    }),
  );

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-3xl font-black text-slate-900">리뷰 관리</h1>
        <Link
          href="/admin/reviews/new"
          className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white font-bold text-sm tracking-widest hover:bg-slate-800 transition-colors"
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
          <p className="text-slate-500 font-light">등록된 리뷰가 없습니다.</p>
        </div>
      ) : (
        <ReviewListClient
          reviews={reviewsWithImageUrls as (Review & { imageUrl: string })[]}
        />
      )}
    </div>
  );
}
