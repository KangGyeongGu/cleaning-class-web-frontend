'use client';

// SPA 라우트 전환 시 GA4 page_view 이벤트를 수동으로 발화하는 프로바이더.
// layout.tsx의 gtag config에서 send_page_view: false 설정과 함께 사용해야 한다.

import { usePathname } from 'next/navigation';
import { useEffect, useRef } from 'react';

export default function AnalyticsProvider(): null {
  const pathname = usePathname();
  // 초기 page_view는 gtag config가 담당하므로 첫 마운트는 건너뜀
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    if (typeof window === 'undefined' || !window.gtag) return;

    window.gtag('event', 'page_view', {
      page_path: pathname,
      page_location: window.location.href,
    });
  }, [pathname]);

  return null;
}
