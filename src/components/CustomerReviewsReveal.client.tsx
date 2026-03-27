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

  // 한 번 진입하면 disconnect — 반복 트리거 방지
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
