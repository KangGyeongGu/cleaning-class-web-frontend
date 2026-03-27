import { createClient } from "@/shared/lib/supabase/server";
import type { ReviewTokenRow, CustomerReviewRow } from "@/shared/types/database";

export async function getReviewTokens(): Promise<ReviewTokenRow[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("review_tokens")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[getReviewTokens] 리뷰 토큰 조회 실패:", error);
    return [];
  }

  return (data as ReviewTokenRow[] | null) ?? [];
}

export async function getAdminCustomerReviews(): Promise<CustomerReviewRow[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("customer_reviews")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[getAdminCustomerReviews] 고객 리뷰 조회 실패:", error);
    return [];
  }

  return (data as CustomerReviewRow[] | null) ?? [];
}
