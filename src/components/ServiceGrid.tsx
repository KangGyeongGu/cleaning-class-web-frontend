"use client";

import { useState, useEffect } from "react";
import { ServiceCard } from "@/components/ServiceCard";

interface ServiceItem {
  id: string;
  title: string;
  /** 서비스 특징 태그 목록 (description 대체) */
  tags: string[];
  imageUrl: string;
  afterImageUrl?: string;
  focalX?: number;
  focalY?: number;
  afterFocalX?: number;
  afterFocalY?: number;
}

/**
 * 서비스 카드 그리드 — 모바일 전용 동기화 타이머 관리
 * 모든 카드의 before/after 전환이 동시에 발생하도록 단일 인터벌 사용
 */
export function ServiceGrid({ services }: { services: ServiceItem[] }) {
  const [showAfter, setShowAfter] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  const hasAfterImages = services.some((s) => s.afterImageUrl);

  useEffect(() => {
    if (!hasAfterImages) return;

    const mq = window.matchMedia("(hover: none)");

    let interval: ReturnType<typeof setInterval> | null = null;

    function start() {
      setIsTouchDevice(true);
      if (interval) clearInterval(interval);
      interval = setInterval(() => {
        setShowAfter((prev) => !prev);
      }, 3000);
    }

    function stop() {
      setIsTouchDevice(false);
      setShowAfter(false);
      if (interval) {
        clearInterval(interval);
        interval = null;
      }
    }

    function handleChange(e: MediaQueryListEvent | MediaQueryList) {
      if (e.matches) start();
      else stop();
    }

    handleChange(mq);
    mq.addEventListener("change", handleChange);

    return () => {
      mq.removeEventListener("change", handleChange);
      stop();
    };
  }, [hasAfterImages]);

  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-8 lg:grid-cols-5">
      {/* 서비스 이미지는 폴드 아래에 위치하므로 priority preload 불필요 (IMG-W01) */}
      {services.map((service) => (
        <ServiceCard
          key={service.id}
          service={service}
          priority={false}
          showAfter={isTouchDevice && showAfter && !!service.afterImageUrl}
        />
      ))}
    </div>
  );
}
