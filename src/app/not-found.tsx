import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-4">
      <div className="text-center max-w-md">
        <h1 className="text-9xl font-black text-slate-900 mb-4">404</h1>
        <p className="text-slate-600 mb-8 text-lg font-light">
          페이지를 찾을 수 없습니다.
        </p>
        <Link
          href="/"
          className="inline-block px-8 py-3 bg-slate-900 text-white font-bold text-sm tracking-widest hover:bg-slate-800 transition-colors"
        >
          홈으로 돌아가기
        </Link>
      </div>
    </div>
  );
}
