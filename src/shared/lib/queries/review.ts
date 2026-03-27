import { createClient } from "@/shared/lib/supabase/server";
import { getReviewImageUrl } from "@/shared/lib/supabase/storage";
import type { Review } from "@/shared/types/database";

export interface ReviewWithImageUrl extends Review {
  imageUrl: string;
}

export async function getReviews(): Promise<ReviewWithImageUrl[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("reviews")
    .select("*")
    .order("sort_order", { ascending: true });

  if (error) {
    console.error("[getReviews] 리뷰 목록 조회 실패:", error);
    return [];
  }

  return ((data as Review[]) ?? []).map((review) => ({
    ...review,
    imageUrl: getReviewImageUrl(review.image_path),
  }));
}

export async function getReviewById(
  id: string,
): Promise<ReviewWithImageUrl | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("reviews")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) {
    if (error) {
      console.error(`[getReviewById] 리뷰 조회 실패 (id=${id}):`, error);
    }
    return null;
  }

  const review = data as Review;
  return {
    ...review,
    imageUrl: getReviewImageUrl(review.image_path),
  };
}

export async function getNextReviewSortOrder(): Promise<number> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("reviews")
    .select("sort_order")
    .order("sort_order", { ascending: false })
    .limit(1)
    .single();

  if (error) {
    // PGRST116: 레코드 없음으로 정상 케이스
    if (error.code !== "PGRST116") {
      console.error("[getNextReviewSortOrder] sort_order 조회 실패:", error);
    }
    return 0;
  }

  return (data?.sort_order ?? -1) + 1;
}
