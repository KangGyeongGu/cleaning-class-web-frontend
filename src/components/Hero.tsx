import { getSiteConfig } from "@/shared/lib/site-config";
import { HeroCTA } from "@/components/HeroCTA";

export async function Hero() {
  // 사이트 설정을 서버에서 직접 조회 (React cache()로 중복 요청 방지)
  const siteConfig = await getSiteConfig();

  const displayName = siteConfig?.business_name ?? "청소클라쓰";
  const description = siteConfig?.description ?? undefined;
  const phone = siteConfig?.phone;

  return (
    <section className="relative flex min-h-[calc(100svh-var(--header-height))] w-full flex-col items-center justify-center overflow-hidden bg-white py-12 text-slate-900 md:py-16">
      <div className="pointer-events-none absolute top-0 left-0 h-full w-full bg-linear-to-br from-slate-100 via-white to-white opacity-5" />

      {/* 모바일에서 hidden으로 GPU 절약, md 이상에서만 표시 */}
      <div
        className="absolute top-1/4 right-1/4 hidden h-64 w-64 animate-[floatUp_6s_ease-in-out_infinite] rounded-full bg-linear-to-b from-slate-50 to-white opacity-60 md:block md:blur-2xl"
        aria-hidden="true"
      />
      <div
        className="absolute bottom-1/3 left-1/4 hidden h-48 w-48 animate-[floatDown_7s_1s_ease-in-out_infinite] rounded-full bg-linear-to-t from-slate-50 to-white opacity-60 md:block md:blur-2xl"
        aria-hidden="true"
      />

      {/* CSS animation 사용: motion 미사용으로 JS 무관하게 SSR 즉시 표시, LCP 최적화 */}
      <div className="z-10 mx-auto max-w-5xl px-4 text-center">
        <h1 className="mb-8 animate-[slideUp_1s_cubic-bezier(0.16,1,0.3,1)_both] text-4xl leading-tight font-semibold tracking-tighter text-slate-900 md:text-6xl">
          {displayName}.
        </h1>

        <p className="mb-12 animate-[slideUp_1s_0.3s_cubic-bezier(0.16,1,0.3,1)_both] text-xl font-light tracking-wide text-slate-600 md:text-2xl">
          {description ?? "완벽함을 넘어선 쾌적함을 선사합니다."}
        </p>

        <HeroCTA phone={phone} />
      </div>
    </section>
  );
}
