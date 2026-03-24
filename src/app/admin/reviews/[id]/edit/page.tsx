import { createClient } from "@/shared/lib/supabase/server";
import { getReviewImageUrl } from "@/shared/lib/supabase/storage";
import { notFound } from "next/navigation";
import { EditReviewForm } from "@/app/admin/reviews/[id]/edit/EditReviewForm";
import type { Review } from "@/shared/types/database";

interface EditReviewPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditReviewPage({ params }: EditReviewPageProps) {
  const { id } = await params;
  const supabase = await createClient();

  // 기존 리뷰 조회
  const { data: review, error } = await supabase
    .from("reviews")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !review) {
    notFound();
  }

  const typedReview = review as Review;
  const imageUrl = getReviewImageUrl(typedReview.image_path);

  return (
    <div className="mx-auto max-w-4xl p-8">
      <h1 className="mb-8 text-3xl font-black text-slate-900">리뷰 수정</h1>
      <EditReviewForm review={typedReview} imageUrl={imageUrl} />
    </div>
  );
}
