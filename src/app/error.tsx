"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-4">
      <div className="text-center max-w-md">
        <h1 className="text-6xl font-black text-slate-900 mb-4">ERROR</h1>
        <p className="text-slate-600 mb-8 text-lg font-light">
          문제가 발생했습니다. 잠시 후 다시 시도해주세요.
        </p>
        {process.env.NODE_ENV === "development" && error.message && (
          <p className="text-slate-400 text-sm mb-8 font-mono">
            {error.message}
          </p>
        )}
        <button
          type="button"
          onClick={reset}
          className="px-8 py-3 bg-slate-900 text-white font-bold text-sm tracking-widest hover:bg-slate-800 transition-colors"
        >
          다시 시도
        </button>
      </div>
    </div>
  );
}
