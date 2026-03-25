import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-white px-4">
      <div className="max-w-md text-center">
        <p
          className="mb-4 text-9xl font-black text-slate-900"
          aria-hidden="true"
        >
          404
        </p>
        <h1 className="mb-8 text-lg font-light text-slate-600">
          요청하신 페이지를 찾을 수 없습니다
        </h1>
        <Link
          href="/"
          className="inline-block bg-slate-900 px-8 py-3 text-sm font-bold tracking-widest text-white transition-colors hover:bg-slate-800"
        >
          홈으로 돌아가기
        </Link>
      </div>
    </div>
  );
}
