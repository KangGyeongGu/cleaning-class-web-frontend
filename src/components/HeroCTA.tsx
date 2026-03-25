"use client";

interface HeroCTAProps {
  phone?: string;
}

export function HeroCTA({ phone }: HeroCTAProps) {
  return (
    <div className="animate-[fadeInScale_0.8s_0.6s_cubic-bezier(0.16,1,0.3,1)_both]">
      <button
        type="button"
        onClick={() =>
          document
            .getElementById("contact")
            ?.scrollIntoView({ behavior: "smooth" })
        }
        className="group relative overflow-hidden border border-slate-900 bg-transparent px-10 py-4 text-lg font-bold text-slate-900 transition-all hover:text-white"
      >
        <span className="absolute inset-0 h-full w-full origin-left scale-x-0 transform bg-slate-900 transition-transform duration-300 ease-out group-hover:scale-x-100" />
        <span className="relative z-10">무료 견적 받기</span>
      </button>

      {phone && (
        <div className="mt-4 flex animate-[fadeIn_0.8s_0.9s_both] items-center justify-center gap-3 text-base font-light text-slate-600">
          <span>전화 상담</span>
          <a
            href={`tel:${phone}`}
            className="inline-flex min-h-12 items-center gap-1.5 px-2 text-lg font-bold tracking-tight text-slate-900 transition-colors hover:text-slate-700"
          >
            {phone}
          </a>
        </div>
      )}
    </div>
  );
}
