interface MobilePhoneButtonProps {
  phone: string;
  movingPhone?: string;
}

export function MobilePhoneButton({
  phone,
  movingPhone,
}: MobilePhoneButtonProps) {
  const hasBoth = !!movingPhone;

  if (hasBoth) {
    return (
      <div className="fixed right-4 bottom-[max(1rem,env(safe-area-inset-bottom))] left-4 z-50 flex overflow-hidden rounded-2xl border border-white/30 bg-white/70 shadow-lg backdrop-blur-xl md:hidden">
        <a
          href={`tel:${phone}`}
          className="flex flex-1 items-center justify-center py-3.5 text-sm font-bold tracking-wide text-slate-900 active:bg-slate-100"
        >
          청소 상담
        </a>
        <span
          className="my-2.5 w-px bg-slate-200"
          aria-hidden="true"
        />
        <a
          href={`tel:${movingPhone}`}
          className="flex flex-1 items-center justify-center py-3.5 text-sm font-bold tracking-wide text-slate-900 active:bg-slate-100"
        >
          이사 상담
        </a>
      </div>
    );
  }

  return (
    <a
      href={`tel:${phone}`}
      className="fixed right-4 bottom-[max(1rem,env(safe-area-inset-bottom))] left-4 z-50 flex items-center justify-center rounded-2xl border border-white/30 bg-white/70 py-3.5 text-center text-sm font-bold tracking-wide text-slate-900 shadow-lg backdrop-blur-xl md:hidden"
    >
      전화 상담
    </a>
  );
}
