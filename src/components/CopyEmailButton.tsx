"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";

interface CopyEmailButtonProps {
  email: string;
}

export function CopyEmailButton({ email }: CopyEmailButtonProps) {
  const [copied, setCopied] = useState(false);

  return (
    <span className="inline-flex items-center gap-2">
      {email}
      <button
        type="button"
        onClick={async () => {
          await navigator.clipboard.writeText(email);
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        }}
        className="text-slate-400 hover:text-slate-900 transition-colors"
        title="이메일 복사"
      >
        {copied ? <Check size={14} /> : <Copy size={14} />}
      </button>
    </span>
  );
}
