"use client";

import Link from "next/link";

/**
 * HeroCTA 컴포넌트 변형
 * - "light": 흰 배경 위 다크 텍스트 (기본값)
 * - "dark": 어두운 배경이미지 위 흰 텍스트
 */
export type HeroCTAVariant = "light" | "dark";

interface HeroCTAProps {
  phone?: string;
  movingPhone?: string;
  variant?: HeroCTAVariant;
}

export function HeroCTA({
  phone,
  movingPhone,
  variant = "light",
}: HeroCTAProps): React.JSX.Element {
  const isDark = variant === "dark";
  const hasAnyPhone = phone || movingPhone;

  return (
    <div className="animate-[fadeInScale_0.8s_0.6s_cubic-bezier(0.16,1,0.3,1)_both]">
      <Link
        href="/contact"
        className={[
          "group relative inline-block overflow-hidden border px-10 py-4 text-lg font-bold transition-all",
          isDark
            ? "border-white text-white hover:text-slate-900"
            : "border-slate-900 text-slate-900 hover:text-white",
        ].join(" ")}
      >
        <span
          className={[
            "absolute inset-0 h-full w-full origin-left scale-x-0 transform transition-transform duration-300 ease-out group-hover:scale-x-100",
            isDark ? "bg-white" : "bg-slate-900",
          ].join(" ")}
          aria-hidden="true"
        />
        <span className="relative z-10">무료 견적 받기</span>
      </Link>

      {hasAnyPhone && (
        <div
          className={[
            "mt-6 flex flex-col items-center gap-2 text-base font-light sm:flex-row sm:justify-center sm:gap-6",
            isDark ? "text-white/80" : "text-slate-600",
          ].join(" ")}
          style={{ animation: "fadeIn 0.8s 0.9s both" }}
        >
          {phone && (
            <div className="flex items-center gap-2">
              <span>청소상담</span>
              <a
                href={`tel:${phone}`}
                className={[
                  "inline-flex min-h-12 items-center text-lg font-bold tracking-tight transition-colors",
                  isDark
                    ? "text-white hover:text-white/80"
                    : "text-slate-900 hover:text-slate-700",
                ].join(" ")}
              >
                {phone}
              </a>
            </div>
          )}
          {movingPhone && (
            <div className="flex items-center gap-2">
              <span>이사상담</span>
              <a
                href={`tel:${movingPhone}`}
                className={[
                  "inline-flex min-h-12 items-center text-lg font-bold tracking-tight transition-colors",
                  isDark
                    ? "text-white hover:text-white/80"
                    : "text-slate-900 hover:text-slate-700",
                ].join(" ")}
              >
                {movingPhone}
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
