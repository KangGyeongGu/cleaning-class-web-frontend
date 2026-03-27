"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Edit, Trash2, Eye, EyeOff, Loader2, GripVertical } from "lucide-react";
import { deleteFaq, toggleFaqActive, reorderFaqs } from "@/shared/actions/faq";
import type { FaqRow } from "@/shared/types/database";

interface FaqListClientProps {
  faqs: FaqRow[];
}

export function FaqListClient({ faqs: initialFaqs }: FaqListClientProps) {
  const router = useRouter();
  const [faqs, setFaqs] = useState(initialFaqs);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const dragItem = useRef<number | null>(null);
  const dragOverItem = useRef<number | null>(null);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const handleDelete = async (faqId: string) => {
    if (!confirm("정말 삭제하시겠습니까?")) return;
    setDeletingId(faqId);
    try {
      const result = await deleteFaq(faqId);
      if (!result.success) {
        alert(result.error ?? "삭제 중 오류가 발생했습니다.");
      } else {
        router.refresh();
      }
    } catch (err) {
      console.error("FAQ 삭제 중 예외 발생:", err);
      alert("삭제 중 오류가 발생했습니다.");
    } finally {
      setDeletingId(null);
    }
  };

  const handleToggleActive = async (faqId: string, currentActive: boolean) => {
    setTogglingId(faqId);
    try {
      const result = await toggleFaqActive(faqId, !currentActive);
      if (!result.success) {
        alert(result.error ?? "활성 상태 변경 중 오류가 발생했습니다.");
      } else {
        router.refresh();
      }
    } catch (err) {
      console.error("FAQ 활성 상태 변경 중 예외 발생:", err);
      alert("활성 상태 변경 중 오류가 발생했습니다.");
    } finally {
      setTogglingId(null);
    }
  };

  const handleDragStart = (index: number) => {
    dragItem.current = index;
    setDragIndex(index);
  };

  const handleDragEnter = (index: number) => {
    dragOverItem.current = index;
    setDragOverIndex(index);
  };

  const handleDragEnd = async () => {
    if (dragItem.current === null || dragOverItem.current === null) {
      setDragIndex(null);
      setDragOverIndex(null);
      return;
    }

    if (dragItem.current === dragOverItem.current) {
      setDragIndex(null);
      setDragOverIndex(null);
      return;
    }

    const updated = [...faqs];
    const [removed] = updated.splice(dragItem.current, 1);
    updated.splice(dragOverItem.current, 0, removed);
    setFaqs(updated);

    dragItem.current = null;
    dragOverItem.current = null;
    setDragIndex(null);
    setDragOverIndex(null);

    setIsSaving(true);
    try {
      const result = await reorderFaqs(
        updated.map((faq, i) => ({ id: faq.id, display_order: i })),
      );
      if (!result.success) {
        alert(result.error ?? "순서 변경 중 오류가 발생했습니다.");
        setFaqs(initialFaqs);
        router.refresh();
      } else {
        router.refresh();
      }
    } catch (err) {
      console.error("reorderFaqs error:", err);
      alert("순서 변경 중 오류가 발생했습니다.");
      setFaqs(initialFaqs);
      router.refresh();
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="border border-slate-200">
      {isSaving && (
        <div className="flex items-center gap-2 border-b border-slate-200 bg-slate-50 px-4 py-2 text-xs text-slate-500">
          <Loader2 size={12} className="animate-spin" />
          순서 저장 중...
        </div>
      )}

      <div className="hidden grid-cols-12 gap-4 border-b border-slate-200 bg-slate-50 p-4 md:grid">
        <div className="text-label col-span-1 text-slate-500">순서</div>
        <div className="text-label col-span-4 text-slate-500">질문</div>
        <div className="text-label col-span-3 text-slate-500">
          답변 미리보기
        </div>
        <div className="text-label col-span-1 text-center text-slate-500">
          활성
        </div>
        <div className="text-label col-span-1 text-slate-500">등록일</div>
        <div className="text-label col-span-2 text-right text-slate-500">
          작업
        </div>
      </div>

      <ul role="list" className="divide-y divide-slate-200">
        {faqs.map((faq, index) => (
          <li
            key={faq.id}
            draggable
            onDragStart={() => handleDragStart(index)}
            onDragEnter={() => handleDragEnter(index)}
            onDragEnd={handleDragEnd}
            onDragOver={(e) => e.preventDefault()}
            className={`cursor-grab space-y-3 p-4 transition-colors active:cursor-grabbing md:grid md:grid-cols-12 md:items-center md:gap-4 md:space-y-0 ${
              dragIndex === index
                ? "bg-slate-50 opacity-50"
                : dragOverIndex === index
                  ? "border-t-2 border-t-slate-900"
                  : ""
            }`}
          >
            <div className="col-span-1 flex items-center gap-2">
              <GripVertical
                size={16}
                className="shrink-0 text-slate-300 hover:text-slate-500"
              />
              <span className="text-xs text-slate-400">{index}</span>
            </div>

            <div className="col-span-4">
              <p className="line-clamp-2 text-sm font-bold text-slate-900">
                {faq.question}
              </p>
            </div>

            <div className="col-span-3">
              <p className="line-clamp-2 text-xs text-slate-500">
                {faq.answer}
              </p>
            </div>

            <div className="col-span-1 text-center">
              <button
                type="button"
                onClick={() => handleToggleActive(faq.id, faq.is_active)}
                disabled={togglingId === faq.id}
                className="inline-flex items-center gap-1 text-xs font-bold text-slate-500 transition-colors hover:text-slate-900 disabled:opacity-50"
              >
                {togglingId === faq.id ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : faq.is_active ? (
                  <Eye size={14} />
                ) : (
                  <EyeOff size={14} />
                )}
                {faq.is_active ? "활성" : "비활성"}
              </button>
            </div>

            <div className="col-span-1">
              <span className="text-xs text-slate-500">
                {new Date(faq.created_at).toLocaleDateString("ko-KR")}
              </span>
            </div>

            <div className="col-span-2 flex justify-end gap-2">
              <Link
                href={`/admin/faq/${faq.id}/edit`}
                className="border border-slate-200 px-3 py-2 text-xs font-bold text-slate-500 transition-colors hover:border-slate-900 hover:text-slate-900"
              >
                <Edit size={14} />
              </Link>
              <button
                type="button"
                onClick={() => handleDelete(faq.id)}
                disabled={deletingId === faq.id}
                className="border border-slate-200 px-3 py-2 text-xs font-bold text-slate-500 transition-colors hover:border-red-500 hover:text-red-500 disabled:opacity-50"
              >
                {deletingId === faq.id ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <Trash2 size={14} />
                )}
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
