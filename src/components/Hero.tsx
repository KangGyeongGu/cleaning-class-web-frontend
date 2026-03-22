"use client";

import { motion, MotionConfig } from "motion/react";

interface HeroProps {
  businessName?: string;
  phone?: string;
  description?: string;
}

export function Hero({ businessName, phone, description }: HeroProps) {
  const displayName = businessName ?? "청소클라쓰";
  return (
    <MotionConfig reducedMotion="user">
      <section className="relative h-screen w-full overflow-hidden bg-white text-slate-900 flex flex-col items-center justify-center">
        {/* Background Abstract Elements */}
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-slate-100 via-white to-white pointer-events-none opacity-5" />

        {/* Floating Elements -- 장식 요소, prefers-reduced-motion 시 애니메이션 비활성화 */}
        <motion.div
          animate={{ y: [0, -30, 0] }}
          transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
          className="absolute top-1/4 right-1/4 w-64 h-64 rounded-full bg-gradient-to-b from-slate-50 to-white opacity-60 blur-2xl motion-reduce:animate-none"
          aria-hidden="true"
        />
        <motion.div
          animate={{ y: [0, 40, 0] }}
          transition={{
            repeat: Infinity,
            duration: 7,
            ease: "easeInOut",
            delay: 1,
          }}
          className="absolute bottom-1/3 left-1/4 w-48 h-48 rounded-full bg-gradient-to-t from-slate-50 to-white opacity-60 blur-2xl motion-reduce:animate-none"
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

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6, duration: 0.8 }}
          >
            <button
              type="button"
              onClick={() =>
                document
                  .getElementById("contact")
                  ?.scrollIntoView({ behavior: "smooth" })
              }
              className="group relative px-10 py-4 bg-transparent border border-slate-900 text-slate-900 text-lg font-bold overflow-hidden transition-all hover:text-white"
            >
              <span className="absolute inset-0 w-full h-full bg-slate-900 transform scale-x-0 origin-left group-hover:scale-x-100 transition-transform duration-300 ease-out"></span>
              <span className="relative z-10">무료 견적 받기</span>
            </button>
          </motion.div>

          {phone && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9, duration: 0.8 }}
              className="mt-4 flex items-center justify-center gap-3 text-base font-normal text-slate-600"
            >
              <span>전화 상담</span>
              <a
                href={`tel:${phone}`}
                className="inline-flex items-center gap-1.5 font-bold text-lg text-slate-900 tracking-tight hover:text-slate-700 transition-colors"
              >
                {phone}
              </a>
            </motion.div>
          )}
        </div>
      </section>
    </MotionConfig>
  );
}
