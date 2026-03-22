import { Phone } from "lucide-react";

interface MobilePhoneButtonProps {
  phone: string;
}

export function MobilePhoneButton({ phone }: MobilePhoneButtonProps) {
  return (
    <a
      href={`tel:${phone}`}
      className="fixed bottom-4 left-4 right-4 z-50 md:hidden rounded-2xl bg-white/70 backdrop-blur-xl border border-white/30 shadow-lg text-slate-900 py-4 text-center font-bold text-sm tracking-widest flex items-center justify-center gap-2"
    >
      <Phone size={16} />
      <span>전화 상담</span>
      <span>{phone}</span>
    </a>
  );
}
