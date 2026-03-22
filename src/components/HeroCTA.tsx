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
        className="group relative px-10 py-4 bg-transparent border border-slate-900 text-slate-900 text-lg font-bold overflow-hidden transition-all hover:text-white"
      >
        <span className="absolute inset-0 w-full h-full bg-slate-900 transform scale-x-0 origin-left group-hover:scale-x-100 transition-transform duration-300 ease-out" />
        <span className="relative z-10">무료 견적 받기</span>
      </button>

      {phone && (
        <div className="mt-4 flex items-center justify-center gap-3 text-base font-normal text-slate-600 animate-[fadeIn_0.8s_0.9s_both]">
          <span>전화 상담</span>
          <a
            href={`tel:${phone}`}
            className="inline-flex items-center gap-1.5 min-h-12 px-2 font-bold text-lg text-slate-900 tracking-tight hover:text-slate-700 transition-colors"
          >
            {phone}
          </a>
        </div>
      )}
    </div>
  );
}
