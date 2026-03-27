import type { Metadata } from "next";
import { getUser } from "@/shared/lib/supabase/auth";
import { createClient } from "@/shared/lib/supabase/server";
import type { ReviewTokenRow, CustomerReviewRow } from "@/shared/types/database";
import {
  TokenListSection,
  CustomerReviewsList,
} from "@/app/admin/customer-reviews/CustomerReviewsAdmin.client";

export const metadata: Metadata = {
  title: "고객 리뷰 관리",
  robots: { index: false, follow: false },
};

export default async function CustomerReviewsPage(): Promise<React.ReactElement> {
  // 인증 확인 — 미인증 시 getUser() 내부에서 리다이렉트
  await getUser();

  const supabase = await createClient();

  // 토큰 목록 조회 — 생성일 내림차순
  const { data: tokensData } = await supabase
    .from("review_tokens")
    .select("*")
    .order("created_at", { ascending: false });

  // 고객 리뷰 조회 — 생성일 내림차순
  const { data: reviewsData } = await supabase
    .from("customer_reviews")
    .select("*")
    .order("created_at", { ascending: false });

  const tokens = (tokensData as ReviewTokenRow[] | null) ?? [];
  const reviews = (reviewsData as CustomerReviewRow[] | null) ?? [];

  return (
    <div className="mx-auto max-w-7xl p-8">
      {/* 페이지 헤더 */}
      <div className="mb-8">
        <h1 className="text-heading-1">고객 리뷰 관리</h1>
        <p className="mt-2 text-sm font-light text-slate-500">
          토큰 링크를 생성해 고객에게 전달하면, 고객이 별점 리뷰를 등록할 수 있습니다.
        </p>
      </div>

      {/* 토큰 관리 섹션 */}
      <div className="mb-12">
        <TokenListSection tokens={tokens} />
      </div>

      {/* 구분선 */}
      <hr className="mb-12 border-slate-100" />

      {/* 고객 리뷰 목록 섹션 */}
      <CustomerReviewsList reviews={reviews} />
    </div>
  );
}
