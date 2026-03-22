import { Phone } from "lucide-react";

interface MobilePhoneButtonProps {
  phone: string;
}

export function MobilePhoneButton({ phone }: MobilePhoneButtonProps) {
  return (
    <a
      href={`tel:${phone}`}
      className="fixed bottom-4 left-4 right-4 z-50 md:hidden bg-slate-900 text-white py-4 text-center font-bold text-sm tracking-widest flex items-center justify-center gap-2 shadow-lg"
    >
      <Phone size={16} />
      <span>전화 상담</span>
      <span>{phone}</span>
    </a>
  );
}
