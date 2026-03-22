"use client";

import { useEffect } from "react";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[admin] 페이지 오류:", error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-100 gap-6">
      <div className="text-center">
        <h2 className="text-xl font-bold text-slate-900 mb-2">
          오류가 발생했습니다
        </h2>
        <p className="text-sm text-slate-500">
          {process.env.NODE_ENV === "development" && error.message
            ? error.message
            : "페이지를 불러오는 중 문제가 발생했습니다."}
        </p>
      </div>
      <button
        type="button"
        onClick={reset}
        className="px-6 py-3 bg-slate-900 text-white font-bold text-sm tracking-widest hover:bg-slate-800 transition-colors"
      >
        다시 시도
      </button>
    </div>
  );
}
