import { HeroCTA } from "@/components/HeroCTA";

interface HeroProps {
  businessName?: string;
  phone?: string;
  description?: string;
}

export function Hero({ businessName, phone, description }: HeroProps) {
  const displayName = businessName ?? "청소클라쓰";
  return (
    <section className="relative min-h-svh w-full overflow-hidden bg-white text-slate-900 flex flex-col items-center justify-center py-16 md:py-24">
      {/* Background Abstract Elements */}
      <div className="absolute top-0 left-0 w-full h-full bg-linear-to-br from-slate-100 via-white to-white pointer-events-none opacity-5" />

      {/* Floating Elements — 모바일에서 hidden으로 GPU 절약, md 이상에서만 표시 */}
      <div
        className="hidden md:block absolute top-1/4 right-1/4 w-64 h-64 rounded-full bg-linear-to-b from-slate-50 to-white opacity-60 md:blur-2xl animate-[floatUp_6s_ease-in-out_infinite]"
        aria-hidden="true"
      />
      <div
        className="hidden md:block absolute bottom-1/3 left-1/4 w-48 h-48 rounded-full bg-linear-to-t from-slate-50 to-white opacity-60 md:blur-2xl animate-[floatDown_7s_1s_ease-in-out_infinite]"
        aria-hidden="true"
      />

      {/* Main Content — h1, p는 CSS animation 사용 (motion 미사용 → JS 무관하게 SSR 즉시 표시, LCP 최적화) */}
      <div className="z-10 text-center px-4 max-w-5xl mx-auto">
        <h1 className="text-4xl md:text-6xl font-semibold tracking-tighter mb-8 text-slate-900 leading-tight animate-[slideUp_1s_cubic-bezier(0.16,1,0.3,1)_both]">
          {displayName}.
        </h1>

        <p className="text-xl md:text-2xl font-light text-slate-600 mb-12 tracking-wide animate-[slideUp_1s_0.3s_cubic-bezier(0.16,1,0.3,1)_both]">
          {description ?? "완벽함을 넘어선 쾌적함을 선사합니다."}
        </p>

        <HeroCTA phone={phone} />
      </div>
    </section>
  );
}
