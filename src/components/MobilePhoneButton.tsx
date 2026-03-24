import { Phone } from "lucide-react";

interface MobilePhoneButtonProps {
  phone: string;
}

export function MobilePhoneButton({ phone }: MobilePhoneButtonProps) {
  return (
    <a
      href={`tel:${phone}`}
      className="fixed right-4 bottom-[max(1rem,env(safe-area-inset-bottom))] left-4 z-50 flex items-center justify-center gap-2 rounded-2xl border border-white/30 bg-white/70 py-4 text-center text-sm font-bold tracking-widest text-slate-900 shadow-lg backdrop-blur-xl md:hidden"
    >
      <Phone size={16} />
      <span>전화 상담</span>
      <span>{phone}</span>
    </a>
  );
}
