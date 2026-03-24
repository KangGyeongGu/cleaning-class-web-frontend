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
        className="inline-flex min-h-11 min-w-11 items-center justify-center p-2 text-slate-400 transition-colors hover:text-slate-900"
        title="이메일 복사"
      >
        {copied ? <Check size={14} /> : <Copy size={14} />}
      </button>
    </span>
  );
}
