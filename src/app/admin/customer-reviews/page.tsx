import type { Metadata } from "next";
import {
  getReviewTokens,
  getAdminCustomerReviews,
} from "@/shared/lib/queries/customer-review";
import {
  TokenListSection,
  CustomerReviewsList,
} from "@/app/admin/customer-reviews/CustomerReviewsAdmin.client";
import { CustomerReviewDescriptionSection } from "@/app/admin/customer-reviews/CustomerReviewDescriptionSection";

export const metadata: Metadata = {
  title: "고객 리뷰 관리",
  robots: { index: false, follow: false },
};

export default async function CustomerReviewsPage(): Promise<React.ReactElement> {
  const [tokens, reviews] = await Promise.all([
    getReviewTokens(),
    getAdminCustomerReviews(),
  ]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 md:p-8">
      <div className="mb-6 md:mb-8">
        <h1 className="text-xl font-black md:text-heading-1">고객 리뷰 관리</h1>
        <p className="mt-1 text-xs font-light text-slate-500 md:mt-2 md:text-sm">
          토큰 링크를 생성해 고객에게 전달하면, 고객이 별점 리뷰를 등록할 수
          있습니다.
        </p>
      </div>

      <div className="mb-6 md:mb-8">
        <CustomerReviewDescriptionSection />
      </div>

      <div className="mb-8 md:mb-12">
        <TokenListSection tokens={tokens} />
      </div>

      <hr className="mb-8 border-slate-100 md:mb-12" />

      <CustomerReviewsList reviews={reviews} />
    </div>
  );
}
