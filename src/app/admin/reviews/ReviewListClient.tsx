"use client";

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Edit, Trash2, Eye, EyeOff, Loader2 } from 'lucide-react';
import { deleteReview, toggleReviewPublish } from '@/shared/actions/review';
import type { Review } from '@/shared/types/database';

interface ReviewListClientProps {
  reviews: (Review & { imageUrl: string })[];
}

export function ReviewListClient({ reviews }: ReviewListClientProps) {
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [togglingId, setTogglingId] = useState<number | null>(null);

  const handleDelete = async (reviewId: number) => {
    if (!confirm('정말 삭제하시겠습니까?')) {
      return;
    }

    setDeletingId(reviewId);
    const result = await deleteReview(String(reviewId));
    setDeletingId(null);

    if (!result.success) {
      alert(result.error || '삭제 중 오류가 발생했습니다.');
    }
  };

  const handleTogglePublish = async (reviewId: number, currentStatus: boolean) => {
    setTogglingId(reviewId);
    const result = await toggleReviewPublish(String(reviewId), !currentStatus);
    setTogglingId(null);

    if (!result.success) {
      alert(result.error || '게시 상태 변경 중 오류가 발생했습니다.');
    }
  };

  return (
    <div className="border border-slate-200">
      {/* Table Header */}
      <div className="hidden md:grid grid-cols-12 gap-4 p-4 bg-slate-50 border-b border-slate-200">
        <div className="col-span-1 text-xs font-bold text-slate-500 uppercase tracking-widest">이미지</div>
        <div className="col-span-3 text-xs font-bold text-slate-500 uppercase tracking-widest">제목</div>
        <div className="col-span-2 text-xs font-bold text-slate-500 uppercase tracking-widest">태그</div>
        <div className="col-span-1 text-xs font-bold text-slate-500 uppercase tracking-widest text-center">게시</div>
        <div className="col-span-1 text-xs font-bold text-slate-500 uppercase tracking-widest text-center">순서</div>
        <div className="col-span-2 text-xs font-bold text-slate-500 uppercase tracking-widest">등록일</div>
        <div className="col-span-2 text-xs font-bold text-slate-500 uppercase tracking-widest text-right">작업</div>
      </div>

      {/* Table Body */}
      <div className="divide-y divide-slate-200">
        {reviews.map((review) => (
          <div key={review.id} className="p-4 md:grid md:grid-cols-12 md:gap-4 md:items-center space-y-3 md:space-y-0">
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
              <p className="font-bold text-slate-900 text-sm line-clamp-2">{review.title}</p>
              <p className="text-xs text-slate-500 mt-1 line-clamp-1">{review.summary}</p>
            </div>

            {/* 태그 */}
            <div className="col-span-2">
              <div className="flex flex-wrap gap-1">
                {review.tags.map((tag, idx) => (
                  <span key={idx} className="text-xs text-slate-500 bg-slate-100 px-2 py-1">
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* 게시 상태 */}
            <div className="col-span-1 text-center">
              <button
                type="button"
                onClick={() => handleTogglePublish(review.id, review.is_published)}
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
                {review.is_published ? '게시' : '비공개'}
              </button>
            </div>

            {/* 정렬 순서 */}
            <div className="col-span-1 text-center">
              <span className="text-sm text-slate-500">{review.sort_order}</span>
            </div>

            {/* 등록일 */}
            <div className="col-span-2">
              <span className="text-xs text-slate-500">
                {new Date(review.created_at).toLocaleDateString('ko-KR')}
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
