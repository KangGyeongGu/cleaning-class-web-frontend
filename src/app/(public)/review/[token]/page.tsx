import type { Metadata } from "next";
import { ReviewSubmitForm } from "@/components/ReviewSubmitForm.client";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "리뷰 작성",
  robots: { index: false, follow: false },
};

interface ReviewPageProps {
  params: Promise<{ token: string }>;
}

export default async function ReviewPage({ params }: ReviewPageProps) {
  const { token } = await params;

  const UUID_PATTERN =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  const isValidFormat = UUID_PATTERN.test(token);

  return (
    <main className="min-h-screen bg-white">
      <div className="flex min-h-screen items-center justify-center px-4 py-16">
        <div className="w-full max-w-lg">
          {isValidFormat ? (
            <ReviewSubmitForm token={token} />
          ) : (
            <InvalidTokenMessage />
          )}
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
