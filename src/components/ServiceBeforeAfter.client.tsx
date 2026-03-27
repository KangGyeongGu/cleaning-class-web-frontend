"use client";

import { useRef } from "react";
import Image from "next/image";
import { motion, useScroll, useTransform } from "motion/react";
import { BLUR_PLACEHOLDER } from "@/shared/lib/image";

interface ServiceBeforeAfterProps {
  beforeSrc: string;
  afterSrc: string;
  alt: string;
}

/**
 * 서비스 소개 페이지 Before/After 이미지 비교 컴포넌트
 * 스크롤 진행도에 따라 After 이미지가 우측에서 좌측으로 자연스럽게 전환
 */
export function ServiceBeforeAfter({
  beforeSrc,
  afterSrc,
  alt,
}: ServiceBeforeAfterProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // 요소가 뷰포트 하단에 진입 ~ 뷰포트 중앙을 지날 때까지 진행도 0→1
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start 0.6", "center 0.4"],
  });

  // 스크롤 진행도(0~1) → clip-path inset 우측 값(100%→0%)
  const clipPath = useTransform(
    scrollYProgress,
    [0, 1],
    ["inset(0 100% 0 0)", "inset(0 0% 0 0)"],
  );

  return (
    <div
      ref={containerRef}
      className="relative aspect-[4/3] w-full overflow-hidden"
    >
      {/* Before 이미지 — 기본 레이어 */}
      <Image
        src={beforeSrc}
        alt={`${alt} — 작업 전`}
        fill
        sizes="(max-width: 768px) calc(100vw - 48px), 320px"
        placeholder="blur"
        blurDataURL={BLUR_PLACEHOLDER}
        className="object-cover"
      />

      {/* After 이미지 — 스크롤에 따라 우측→좌측으로 드러남 */}
      <motion.div className="absolute inset-0" style={{ clipPath, willChange: "clip-path" }}>
        <Image
          src={afterSrc}
          alt={`${alt} — 작업 후`}
          fill
          sizes="(max-width: 768px) calc(100vw - 48px), 320px"
          placeholder="blur"
          blurDataURL={BLUR_PLACEHOLDER}
          className="object-cover"
        />
      </motion.div>
    </div>
  );
}
