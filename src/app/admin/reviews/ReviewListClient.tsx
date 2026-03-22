"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Edit, Trash2, Eye, EyeOff, Loader2, GripVertical } from "lucide-react";
import {
  deleteReview,
  toggleReviewPublish,
  reorderReviews,
} from "@/shared/actions/review";
import type { Review } from "@/shared/types/database";

interface ReviewListClientProps {
  reviews: (Review & { imageUrl: string })[];
}

export function ReviewListClient({
  reviews: initialReviews,
}: ReviewListClientProps) {
  const router = useRouter();
  const [reviews, setReviews] = useState(initialReviews);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const dragItem = useRef<number | null>(null);
  const dragOverItem = useRef<number | null>(null);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const handleDelete = async (reviewId: string) => {
    if (!confirm("정말 삭제하시겠습니까?")) return;
    setDeletingId(reviewId);
    const result = await deleteReview(reviewId);
    setDeletingId(null);
    if (!result.success) {
      alert(result.error || "삭제 중 오류가 발생했습니다.");
    } else {
      router.refresh();
    }
  };

  const handleTogglePublish = async (
    reviewId: string,
    currentStatus: boolean,
  ) => {
    setTogglingId(reviewId);
    const result = await toggleReviewPublish(reviewId, !currentStatus);
    setTogglingId(null);
    if (!result.success) {
      alert(result.error || "게시 상태 변경 중 오류가 발생했습니다.");
    } else {
      router.refresh();
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

    const updated = [...reviews];
    const [removed] = updated.splice(dragItem.current, 1);
    updated.splice(dragOverItem.current, 0, removed);
    setReviews(updated);

    dragItem.current = null;
    dragOverItem.current = null;
    setDragIndex(null);
    setDragOverIndex(null);

    setIsSaving(true);
    const result = await reorderReviews(updated.map((r) => r.id));
    setIsSaving(false);

    if (!result.success) {
      alert(result.error || "순서 변경 중 오류가 발생했습니다.");
      setReviews(initialReviews);
    } else {
      router.refresh();
    }
  };

  return (
    <div className="border border-slate-200">
      {isSaving && (
        <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 border-b border-slate-200 text-xs text-slate-500">
          <Loader2 size={12} className="animate-spin" />
          순서 저장 중...
        </div>
      )}

      {/* Table Header */}
      <div className="hidden md:grid grid-cols-12 gap-4 p-4 bg-slate-50 border-b border-slate-200">
        <div className="col-span-1 text-xs font-bold text-slate-500 uppercase tracking-widest">
          순서
        </div>
        <div className="col-span-1 text-xs font-bold text-slate-500 uppercase tracking-widest">
          이미지
        </div>
        <div className="col-span-3 text-xs font-bold text-slate-500 uppercase tracking-widest">
          제목
        </div>
        <div className="col-span-2 text-xs font-bold text-slate-500 uppercase tracking-widest">
          태그
        </div>
        <div className="col-span-1 text-xs font-bold text-slate-500 uppercase tracking-widest text-center">
          게시
        </div>
        <div className="col-span-2 text-xs font-bold text-slate-500 uppercase tracking-widest">
          등록일
        </div>
        <div className="col-span-2 text-xs font-bold text-slate-500 uppercase tracking-widest text-right">
          작업
        </div>
      </div>

      {/* Table Body */}
      <div className="divide-y divide-slate-200">
        {reviews.map((review, index) => (
          <div
            key={review.id}
            draggable
            onDragStart={() => handleDragStart(index)}
            onDragEnter={() => handleDragEnter(index)}
            onDragEnd={handleDragEnd}
            onDragOver={(e) => e.preventDefault()}
            className={`p-4 md:grid md:grid-cols-12 md:gap-4 md:items-center space-y-3 md:space-y-0 cursor-grab active:cursor-grabbing transition-colors ${
              dragIndex === index
                ? "opacity-50 bg-slate-50"
                : dragOverIndex === index
                  ? "border-t-2 border-t-slate-900"
                  : ""
            }`}
          >
            {/* 드래그 핸들 */}
            <div className="col-span-1 flex items-center gap-2">
              <GripVertical
                size={16}
                className="text-slate-300 hover:text-slate-500 flex-shrink-0"
              />
              <span className="text-xs text-slate-400">{index}</span>
            </div>

            {/* 이미지 */}
            <div className="col-span-1">
              <div className="relative w-16 h-16 border border-slate-200">
                <Image
                  src={review.imageUrl}
                  alt={review.title}
                  fill
                  className="object-cover"
                  sizes="64px"
                />
              </div>
            </div>

            {/* 제목 */}
            <div className="col-span-3">
              <p className="font-bold text-slate-900 text-sm line-clamp-2">
                {review.title}
              </p>
              <p className="text-xs text-slate-500 mt-1 line-clamp-1">
                {review.summary}
              </p>
            </div>

            {/* 태그 */}
            <div className="col-span-2">
              <div className="flex flex-wrap gap-1">
                {review.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-xs text-slate-500 bg-slate-100 px-2 py-1"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* 게시 상태 */}
            <div className="col-span-1 text-center">
              <button
                type="button"
                onClick={() =>
                  handleTogglePublish(review.id, review.is_published)
                }
                disabled={togglingId === review.id}
                className="inline-flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors disabled:opacity-50"
              >
                {togglingId === review.id ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : review.is_published ? (
                  <Eye size={14} />
                ) : (
                  <EyeOff size={14} />
                )}
                {review.is_published ? "게시" : "비공개"}
              </button>
            </div>

            {/* 등록일 */}
            <div className="col-span-2">
              <span className="text-xs text-slate-500">
                {new Date(review.created_at).toLocaleDateString("ko-KR")}
              </span>
            </div>

            {/* 작업 버튼 */}
            <div className="col-span-2 flex justify-end gap-2">
              <Link
                href={`/admin/reviews/${review.id}/edit`}
                className="px-3 py-2 border border-slate-200 text-slate-500 hover:border-slate-900 hover:text-slate-900 transition-colors text-xs font-bold"
              >
                <Edit size={14} />
              </Link>
              <button
                type="button"
                onClick={() => handleDelete(review.id)}
                disabled={deletingId === review.id}
                className="px-3 py-2 border border-slate-200 text-slate-500 hover:border-red-500 hover:text-red-500 transition-colors text-xs font-bold disabled:opacity-50"
              >
                {deletingId === review.id ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <Trash2 size={14} />
                )}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
