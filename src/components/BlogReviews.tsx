"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, ArrowUpRight, Instagram } from "lucide-react";
import Image from "next/image";
import Slider, { type CustomArrowProps } from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import type { Review } from "@/shared/types/database";
import { getReviewImageUrl } from "@/shared/lib/supabase/storage";

const BLUR_PLACEHOLDER =
  "data:image/webp;base64,UklGRlYAAABXRUJQVlA4IEoAAADQAQCdASoIAAUAAkA4JZQCdAEO/hepgAAA/vxLOv98KRk4BgLv/5P/AOiV/wPYpn+N1Vf/UYx1Z//0YSz6Le/+igAAAA==";

function NaverBlogIcon({ size = 16 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M16.273 12.845 7.376 0H0v24h7.727V11.155L16.624 24H24V0h-7.727v12.845Z" />
    </svg>
  );
}

interface BlogReviewsProps {
  reviews: Review[];
  blogUrl?: string;
  instagramUrl?: string;
  reviewDescription?: string;
}

function NextArrow(props: CustomArrowProps) {
  const { onClick } = props;
  return (
    <button
      type="button"
      aria-label="다음 리뷰"
      className="absolute top-1/2 -right-4 z-20 flex h-12 w-12 -translate-y-1/2 transform items-center justify-center rounded-full border border-slate-200 bg-white text-slate-900 shadow-lg transition-all hover:border-slate-900 hover:bg-slate-900 hover:text-white md:-right-8 lg:-right-12"
      onClick={onClick}
    >
      <ArrowRight className="h-5 w-5" />
    </button>
  );
}

function PrevArrow(props: CustomArrowProps) {
  const { onClick } = props;
  return (
    <button
      type="button"
      aria-label="이전 리뷰"
      className="absolute top-1/2 -left-4 z-20 flex h-12 w-12 -translate-y-1/2 transform items-center justify-center rounded-full border border-slate-200 bg-white text-slate-900 shadow-lg transition-all hover:border-slate-900 hover:bg-slate-900 hover:text-white md:-left-8 lg:-left-12"
      onClick={onClick}
    >
      <ArrowLeft className="h-5 w-5" />
    </button>
  );
}

function ReviewCard({
  review,
  priority = false,
}: {
  review: Review;
  priority?: boolean;
}) {
  return (
    <div className="flex h-full flex-col">
      {/* Image Section */}
      <div className="relative mb-5 aspect-16/9 shrink-0 overflow-hidden bg-slate-200 md:aspect-4/3">
        <Image
          src={getReviewImageUrl(review.image_path)}
          alt={review.title}
          fill
          priority={priority}
          sizes="(max-width: 768px) 85vw, (max-width: 1280px) 33vw, 25vw"
          placeholder="blur"
          blurDataURL={BLUR_PLACEHOLDER}
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
        />
      </div>

      {/* Content Section */}
      <div className="flex flex-1 flex-col px-5 pb-6">
        {/* Hashtags */}
        <div className="mb-1.5 flex min-h-5 flex-wrap gap-2">
          {review.tags.map((tag) => (
            <span
              key={tag}
              className="text-xs tracking-wider text-slate-600 uppercase"
            >
              {tag}
            </span>
          ))}
        </div>

        <h3 className="mb-2 line-clamp-2 min-h-13 text-lg leading-snug font-bold text-slate-900 transition-colors group-hover:text-slate-700">
          {review.title}
        </h3>

        <p className="mb-4 line-clamp-2 min-h-10 text-sm leading-relaxed font-normal text-slate-700">
          {review.summary}
        </p>

        <div className="mt-auto flex justify-end">
          <div className="flex w-fit items-center gap-2 border-b border-transparent pb-1 text-xs font-bold tracking-widest text-slate-900 uppercase transition-all group-hover:border-slate-900">
            More <ArrowUpRight size={12} aria-hidden="true" />
          </div>
        </div>
      </div>
    </div>
  );
}

function ReviewCardWrapper({
  review,
  blogUrl,
  priority = false,
}: {
  review: Review;
  blogUrl?: string;
  priority?: boolean;
}) {
  const cardUrl = review.link_url || blogUrl || null;
  if (cardUrl) {
    return (
      <a
        href={cardUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="group block h-full overflow-hidden rounded-xl border border-slate-200 bg-white transition-all duration-300 hover:border-slate-400 hover:shadow-xl"
      >
        <ReviewCard review={review} priority={priority} />
      </a>
    );
  }
  return (
    <div className="group h-full overflow-hidden rounded-xl border border-slate-200 bg-white">
      <ReviewCard review={review} priority={priority} />
    </div>
  );
}

export function BlogReviews({
  reviews,
  blogUrl,
  instagramUrl,
  reviewDescription,
}: BlogReviewsProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const scrollLeft = el.scrollLeft;
    const cardWidth = el.firstElementChild?.clientWidth ?? 1;
    const gap = 16; // gap-4 = 16px
    const index = Math.round(scrollLeft / (cardWidth + gap));
    setActiveIndex(index);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener("scroll", handleScroll, { passive: true });
    return () => el.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  // 리뷰가 없으면 섹션 숨김
  if (!reviews || reviews.length === 0) {
    return null;
  }

  const hasBlogUrl = blogUrl && blogUrl.trim() !== "";
  const hasInstagramUrl = instagramUrl && instagramUrl.trim() !== "";

  const slickSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 4,
    slidesToScroll: 1,
    nextArrow: <NextArrow />,
    prevArrow: <PrevArrow />,
    responsive: [
      {
        breakpoint: 1280,
        settings: { slidesToShow: 3 },
      },
      {
        breakpoint: 1024,
        settings: { slidesToShow: 3 },
      },
    ],
  };

  return (
    <section
      id="reviews"
      className="relative overflow-hidden bg-white py-16 md:py-32"
    >
      <div className="max-w-8xl container mx-auto px-4 md:px-20 lg:px-24">
        <div className="mb-10 flex flex-col items-start justify-between md:flex-row md:items-end md:px-2">
          <div>
            <h2 className="mb-4 text-3xl font-black tracking-tight text-slate-900 md:text-4xl">
              REVIEW
            </h2>
            <p className="max-w-lg text-sm font-light tracking-wide text-slate-500 md:text-base">
              {reviewDescription ||
                "의뢰 전 업체의 작업 방식을 확인할 수 있는 후기들을 확인해보세요."}
            </p>
          </div>

          <div className="hidden items-center gap-4 md:flex">
            {hasBlogUrl && (
              <a
                href={blogUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm font-medium tracking-wide text-slate-500 transition-colors hover:text-slate-900"
              >
                <NaverBlogIcon size={16} /> BLOG{" "}
                <ArrowUpRight size={16} aria-hidden="true" />
              </a>
            )}
            {hasInstagramUrl && (
              <a
                href={instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm font-medium tracking-wide text-slate-500 transition-colors hover:text-slate-900"
              >
                <Instagram size={16} /> INSTAGRAM{" "}
                <ArrowUpRight size={16} aria-hidden="true" />
              </a>
            )}
          </div>
        </div>

        {/* 모바일: CSS scroll-snap (JS 의존 없음) */}
        <div
          ref={scrollRef}
          className="scrollbar-hide flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth pb-4 md:hidden"
        >
          {reviews.map((review, index) => (
            <div key={review.id} className="w-[85vw] shrink-0 snap-center">
              <ReviewCardWrapper
                review={review}
                blogUrl={blogUrl}
                priority={index === 0}
              />
            </div>
          ))}
        </div>
        {/* 모바일 인디케이터 */}
        <div className="mt-4 flex justify-center gap-2 md:hidden">
          {reviews.map((review, index) => (
            <button
              key={review.id}
              type="button"
              aria-label={`리뷰 ${index + 1}`}
              className={`h-2 w-2 rounded-full transition-colors ${
                index === activeIndex ? "bg-slate-900" : "bg-slate-300"
              }`}
              onClick={() => {
                const el = scrollRef.current;
                if (!el) return;
                const cardWidth = el.firstElementChild?.clientWidth ?? 0;
                const gap = 16;
                el.scrollTo({
                  left: index * (cardWidth + gap),
                  behavior: "smooth",
                });
              }}
            />
          ))}
        </div>

        {/* 데스크톱: slick carousel */}
        <div className="relative hidden px-2 md:block">
          <Slider {...slickSettings}>
            {reviews.map((review, index) => {
              return (
                <div key={review.id} className="px-3 py-4">
                  <ReviewCardWrapper
                    review={review}
                    blogUrl={blogUrl}
                    priority={index === 0}
                  />
                </div>
              );
            })}
          </Slider>
        </div>

        {(hasBlogUrl || hasInstagramUrl) && (
          <div className="mt-12 flex flex-col items-center gap-3 text-center md:hidden">
            {hasBlogUrl && (
              <a
                href={blogUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm font-bold text-slate-900 transition-colors hover:text-slate-600"
              >
                <NaverBlogIcon size={16} /> BLOG{" "}
                <ArrowUpRight size={16} aria-hidden="true" />
              </a>
            )}
            {hasInstagramUrl && (
              <a
                href={instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm font-bold text-slate-900 transition-colors hover:text-slate-600"
              >
                <Instagram size={16} /> INSTAGRAM{" "}
                <ArrowUpRight size={16} aria-hidden="true" />
              </a>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
