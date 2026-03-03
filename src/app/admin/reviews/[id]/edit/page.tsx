import { createClient } from '@/shared/lib/supabase/server';
import { getReviewImageUrl } from '@/shared/lib/supabase/storage';
import { notFound } from 'next/navigation';
import { EditReviewForm } from '@/app/admin/reviews/[id]/edit/EditReviewForm';
import type { Review } from '@/shared/types/database';

interface EditReviewPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditReviewPage({ params }: EditReviewPageProps) {
  const { id } = await params;
  const supabase = await createClient();

  // 기존 리뷰 조회
  const { data: review, error } = await supabase
    .from('reviews')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !review) {
    notFound();
  }

  const typedReview = review as Review;
  const imageUrl = getReviewImageUrl(typedReview.image_path);

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-black text-slate-900 mb-8">리뷰 수정</h1>
      <EditReviewForm review={typedReview} imageUrl={imageUrl} />
    </div>
  );
}
