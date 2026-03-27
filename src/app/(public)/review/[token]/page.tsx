import type { Metadata } from "next";
import { ReviewSubmitForm } from "@/components/ReviewSubmitForm.client";

export const dynamic = "force-dynamic";

// 리뷰 등록 페이지 — 검색 엔진 색인 제외 (토큰 기반 1회성 페이지)
export const metadata: Metadata = {
  title: "리뷰 작성",
  robots: { index: false, follow: false },
};

interface ReviewPageProps {
  params: Promise<{ token: string }>;
}

export default async function ReviewPage({ params }: ReviewPageProps) {
  const { token } = await params;

  // 형식 사전 검사만 수행 — 실제 유효성(만료·사용 여부)은 서버 액션에서 원자적으로 처리
  const UUID_PATTERN =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  const isValidFormat = UUID_PATTERN.test(token);

  return (
    <main className="min-h-screen bg-white">
      <div className="flex min-h-screen items-center justify-center px-4 py-16">
        <div className="w-full max-w-lg">
          <div className="mb-10 text-center">
            <p className="text-xs font-medium tracking-widest text-slate-400 uppercase">
              청소클라쓰
            </p>
            <h1 className="text-heading-1 mt-2">고객 리뷰</h1>
            <p className="mt-3 text-sm font-light text-slate-500">
              서비스 이용 소감을 솔직하게 남겨주세요.
            </p>
          </div>

          <div className="border border-slate-100 bg-white p-8">
            {isValidFormat ? (
              <ReviewSubmitForm token={token} />
            ) : (
              <InvalidTokenMessage />
            )}
          </div>

          <p className="mt-8 text-center text-xs text-slate-400">
            리뷰 링크는 1회만 사용할 수 있으며 30일 후 만료됩니다.
          </p>
        </div>
      </div>
    </main>
  );
}

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
