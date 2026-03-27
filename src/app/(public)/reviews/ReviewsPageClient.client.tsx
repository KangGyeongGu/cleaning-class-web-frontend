"use client";

import { useState } from "react";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import type { Review } from "@/shared/types/database";
import { getReviewImageUrl } from "@/shared/lib/supabase/storage";
import { CLEANING_SERVICE_TYPES } from "@/shared/lib/constants";

// 블러 플레이스홀더 — 이미지 로딩 전 자리를 채워 CLS 방지
const BLUR_PLACEHOLDER =
  "data:image/webp;base64,UklGRlYAAABXRUJQVlA4IEoAAADQAQCdASoIAAUAAkA4JZQCdAEO/hepgAAA/vxLOv98KRk4BgLv/5P/AOiV/wPYpn+N1Vf/UYx1Z//0YSz6Le/+igAAAA==";

interface ReviewsPageClientProps {
  reviews: Review[];
}

function ReviewCard({ review }: { review: Review }) {
  const cardUrl = review.link_url || null;

  const inner = (
    <article className="group flex h-full flex-col overflow-hidden rounded-xl border border-slate-200 bg-white transition-all duration-300 hover:border-slate-400 hover:shadow-lg">
      <div className="relative aspect-video shrink-0 overflow-hidden bg-slate-100">
        <Image
          src={getReviewImageUrl(review.image_path)}
          alt={review.title}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          placeholder="blur"
          blurDataURL={BLUR_PLACEHOLDER}
          className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
        />
      </div>

      <div className="flex flex-1 flex-col px-5 py-5">
        <div className="mb-3 flex min-h-5 flex-wrap gap-1.5">
          {review.tags.map((tag) => (
            <span key={tag} className="tag-pill text-xs">
              {tag}
            </span>
          ))}
        </div>

        <h3 className="text-heading-3 mb-2 line-clamp-2 leading-snug transition-colors group-hover:text-slate-700">
          {review.title}
        </h3>

        <p className="mb-4 line-clamp-2 text-sm leading-relaxed font-normal text-slate-500">
          {review.summary}
        </p>

        {cardUrl && (
          <div className="mt-auto flex justify-end" aria-hidden="true">
            <span className="text-label flex w-fit items-center gap-1.5 border-b border-transparent pb-0.5 text-slate-900 transition-all group-hover:border-slate-900">
              후기 보기 <ArrowUpRight size={12} />
            </span>
          </div>
        )}
      </div>
    </article>
  );

  if (cardUrl) {
    return (
      <a
        href={cardUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="block h-full"
        aria-label={`${review.title} — 블로그에서 보기`}
      >
        {inner}
      </a>
    );
  }

  return <div className="h-full">{inner}</div>;
}

export function ReviewsPageClient({ reviews }: ReviewsPageClientProps) {
  const [activeFilter, setActiveFilter] = useState<string | null>(null);

  const filteredReviews = activeFilter
    ? reviews.filter((r) => r.tags.includes(activeFilter))
    : reviews;

  return (
    <div>
      <div
        className="scrollbar-hide mb-10 flex gap-2 overflow-x-auto"
        role="tablist"
        aria-label="서비스 유형 필터"
      >
        <button
          type="button"
          role="tab"
          aria-selected={activeFilter === null}
          onClick={() => setActiveFilter(null)}
          className={`btn-filter shrink-0 ${activeFilter === null ? "btn-filter-active" : "btn-filter-inactive"}`}
        >
          전체
        </button>
        {CLEANING_SERVICE_TYPES.map((type) => (
          <button
            key={type}
            type="button"
            role="tab"
            aria-selected={activeFilter === type}
            onClick={() => setActiveFilter(type)}
            className={`btn-filter shrink-0 ${activeFilter === type ? "btn-filter-active" : "btn-filter-inactive"}`}
          >
            {type}
          </button>
        ))}
      </div>

      {filteredReviews.length === 0 ? (
        <div className="flex min-h-64 items-center justify-center rounded-xl border border-slate-200 bg-slate-50">
          <p className="text-sm font-light text-slate-400">
            해당 카테고리의 후기가 없습니다.
          </p>
        </div>
      ) : (
        <>
          <p className="mb-6 text-sm font-light text-slate-400">
            총 {filteredReviews.length}건
          </p>

          <ul
            className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
            role="list"
          >
            {filteredReviews.map((review) => (
              <li key={review.id}>
                <ReviewCard review={review} />
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
