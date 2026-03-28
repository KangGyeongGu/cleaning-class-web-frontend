'use client';

/**
 * 서버 컴포넌트에서 사용할 CTA 링크 클라이언트 래퍼.
 * 클릭 시 GA4 select_content(cta_button) 이벤트를 발화하고 next/link 라우팅을 유지한다.
 */

import Link from 'next/link';
import { trackSelectContent } from '@/shared/lib/analytics';
import type { CtaButtonId } from '@/shared/lib/analytics';

interface TrackedCtaLinkProps {
  /** 이동할 내부 경로 */
  href: string;
  /** CTA 버튼 식별자 — GA4 content_id에 매핑 */
  contentId: CtaButtonId;
  children: React.ReactNode;
  className?: string;
}

/**
 * CTA 버튼 클릭 이벤트를 추적하는 next/link 래퍼.
 * onClick에서 추적 이벤트를 발화한 뒤 Link의 기본 라우팅 동작을 유지한다.
 */
export default function TrackedCtaLink({
  href,
  contentId,
  children,
  className,
}: TrackedCtaLinkProps): React.ReactElement {
  function handleClick(): void {
    trackSelectContent({
      content_type: 'cta_button',
      content_id: contentId,
    });
  }

  return (
    <Link href={href} onClick={handleClick} className={className}>
      {children}
    </Link>
  );
}
