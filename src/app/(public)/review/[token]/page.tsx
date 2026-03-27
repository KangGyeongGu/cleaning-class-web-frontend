import type { Metadata } from "next";
import { ReviewSubmitForm } from "@/components/ReviewSubmitForm.client";

// 리뷰 등록 페이지 — 검색 엔진 색인 제외 (토큰 기반 1회성 페이지)
export const metadata: Metadata = {
  title: "리뷰 작성",
  robots: { index: false, follow: false },
};

// ── 페이지 ──────────────────────────────────────────────────────────────────

interface ReviewPageProps {
  params: Promise<{ token: string }>;
}

export default async function ReviewPage({ params }: ReviewPageProps) {
  // Next.js 15+ — params는 비동기적으로 접근해야 함
  const { token } = await params;

  // 토큰 형식 사전 검사 — UUID 패턴에 맞지 않으면 즉시 에러 표시
  // 실제 유효성(만료·사용 여부)은 서버 액션 submitCustomerReview에서 원자적으로 처리
  const UUID_PATTERN =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  const isValidFormat = UUID_PATTERN.test(token);

  return (
    <main className="min-h-screen bg-white">
      <div className="flex min-h-screen items-center justify-center px-4 py-16">
        <div className="w-full max-w-lg">
          {/* 회사 신뢰도 표시 헤더 */}
          <div className="mb-10 text-center">
            <p className="text-xs font-medium uppercase tracking-widest text-slate-400">
              청소클라쓰
            </p>
            <h1 className="text-heading-1 mt-2">고객 리뷰</h1>
            <p className="mt-3 text-sm font-light text-slate-500">
              서비스 이용 소감을 솔직하게 남겨주세요.
            </p>
          </div>

          {/* 폼 카드 */}
          <div className="border border-slate-100 bg-white p-8">
            {isValidFormat ? (
              /*
               * 형식이 유효한 경우 폼 렌더링.
               * 실제 토큰 만료·사용 여부는 submitCustomerReview가 처리하며,
               * 제출 실패 시 "유효하지 않거나 만료된 링크입니다" 에러를 표시함.
               */
              <ReviewSubmitForm token={token} />
            ) : (
              /* UUID 형식이 아닌 경우 즉시 에러 표시 */
              <InvalidTokenMessage />
            )}
          </div>

          {/* 하단 안내 */}
          <p className="mt-8 text-center text-xs text-slate-400">
            리뷰 링크는 1회만 사용할 수 있으며 30일 후 만료됩니다.
          </p>
        </div>
      </div>
    </main>
  );
}

// 무효·만료·사용된 토큰에 대해 통일된 에러 메시지 컴포넌트
function InvalidTokenMessage() {
  return (
    <div className="py-6 text-center">
      <p className="text-sm font-medium text-slate-900">
        유효하지 않거나 만료된 링크입니다
      </p>
      <p className="mt-2 text-xs font-light text-slate-500">
        링크가 만료되었거나 이미 사용된 링크입니다.
        <br />
        새로운 링크가 필요하시면 청소클라쓰로 문의해 주세요.
      </p>
    </div>
  );
}
