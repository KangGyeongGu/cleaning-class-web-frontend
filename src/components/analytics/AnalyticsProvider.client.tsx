'use client';

/**
 * SPA 라우트 전환 시 GA4 page_view 이벤트를 수동으로 발화하는 프로바이더 컴포넌트.
 * layout.tsx의 gtag config에서 send_page_view: false 설정과 함께 사용해야 한다.
 * useRef로 첫 렌더(초기 진입)를 건너뜀 — gtag config가 초기 page_view를 이미 처리하기 때문.
 */

import { usePathname } from 'next/navigation';
import { useEffect, useRef } from 'react';

export default function AnalyticsProvider(): null {
  const pathname = usePathname();
  // 첫 마운트 여부 추적 — 초기 page_view는 gtag config가 담당
  const isFirstRender = useRef(true);

  useEffect(() => {
    // 첫 렌더는 건너뜀
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    // 라우트 전환 시 page_view 수동 발화
    if (typeof window === 'undefined' || !window.gtag) return;

    window.gtag('event', 'page_view', {
      page_path: pathname,
      page_location: window.location.href,
    });
  }, [pathname]);

  return null;
}
