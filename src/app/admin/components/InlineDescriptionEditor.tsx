"use client";

import { useState } from "react";
import { Pencil, X, Check, Loader2 } from "lucide-react";

interface InlineDescriptionEditorProps {
  initialValue: string;
  placeholder: string;
  emptyText: string;
  onSave: (value: string) => Promise<{ success: boolean; error?: string }>;
}

export function InlineDescriptionEditor({
  initialValue,
  placeholder,
  emptyText,
  onSave,
}: InlineDescriptionEditorProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState(initialValue);
  const [draft, setDraft] = useState(initialValue);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    const result = await onSave(draft);
    setIsSaving(false);

    if (result.success) {
      setValue(draft);
      setIsEditing(false);
    } else {
      alert(result.error || "저장 중 오류가 발생했습니다.");
    }
  };

  const handleCancel = () => {
    setDraft(value);
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <div className="flex items-center gap-2 mb-8">
        <input
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          className="flex-1 px-3 py-2 border border-slate-300 text-sm font-light text-slate-600 focus:border-slate-900 focus:outline-none transition-colors"
          placeholder={placeholder}
          autoFocus
        />
        <button
          type="button"
          onClick={handleCancel}
          disabled={isSaving}
          className="p-2 text-slate-400 hover:text-slate-900 transition-colors disabled:opacity-50"
          title="취소"
        >
          <X size={16} />
        </button>
        <button
          type="button"
          onClick={handleSave}
          disabled={isSaving}
          className="p-2 text-slate-400 hover:text-green-600 transition-colors disabled:opacity-50"
          title="저장"
        >
          {isSaving ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <Check size={16} />
          )}
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 mb-8">
      <p className="text-sm font-light text-slate-500">{value || emptyText}</p>
      <button
        type="button"
        onClick={() => setIsEditing(true)}
        className="p-1 text-slate-400 hover:text-slate-900 transition-colors"
        title="안내 문구 수정"
      >
        <Pencil size={14} />
      </button>
    </div>
  );
}
