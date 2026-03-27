// 고객 리뷰 목록 스크롤 진입 애니메이션 래퍼 — 클라이언트 컴포넌트 최소 범위 적용
// IntersectionObserver로 뷰포트 진입 감지 후 CSS transition으로 페이드인

"use client";

import { useEffect, useRef, useState } from "react";

interface CustomerReviewsRevealProps {
  children: React.ReactNode;
}

export function CustomerReviewsReveal({
  children,
}: CustomerReviewsRevealProps): React.ReactElement {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  // 뷰포트 진입 시 한 번만 트리거하여 성능 최적화
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? "translateY(0)" : "translateY(20px)",
        transition: "opacity 0.6s ease-out, transform 0.6s ease-out",
      }}
    >
      {children}
    </div>
  );
}
