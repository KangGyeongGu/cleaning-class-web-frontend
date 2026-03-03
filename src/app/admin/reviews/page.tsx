import Link from 'next/link';
import { createClient } from '@/shared/lib/supabase/server';
import { getReviewImageUrl } from '@/shared/lib/supabase/storage';
import { Plus } from 'lucide-react';
import { ReviewListClient } from '@/app/admin/reviews/ReviewListClient';
import type { Review } from '@/shared/types/database';

export default async function ReviewsPage() {
  const supabase = await createClient();

  // 리뷰 목록 조회 (정렬 순서 오름차순)
  const { data: reviews, error } = await supabase
    .from('reviews')
    .select('*')
    .order('sort_order', { ascending: true });

  if (error) {
    console.error('리뷰 목록 조회 실패:', error);
  }

  const reviewsWithImageUrls = (reviews as Review[] ?? []).map((review) => ({
    ...review,
    imageUrl: getReviewImageUrl(review.image_path),
  }));

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-black text-slate-900">리뷰 관리</h1>
        <Link
          href="/admin/reviews/new"
          className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white font-bold text-sm tracking-widest hover:bg-slate-800 transition-colors"
        >
          <Plus size={18} />
          신규 등록
        </Link>
      </div>

      {reviewsWithImageUrls.length === 0 ? (
        <div className="border border-slate-200 p-12 text-center">
          <p className="text-slate-500 font-light">등록된 리뷰가 없습니다.</p>
        </div>
      ) : (
        <ReviewListClient reviews={reviewsWithImageUrls as (Review & { imageUrl: string })[]} />
      )}
    </div>
  );
}
