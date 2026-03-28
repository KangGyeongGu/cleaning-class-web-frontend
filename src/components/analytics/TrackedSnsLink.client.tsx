'use client';

/**
 * 서버 컴포넌트에서 사용할 외부 SNS 링크 클라이언트 래퍼.
 * 클릭 시 GA4 sns_click 이벤트를 발화하고 새 탭에서 링크를 연다.
 */

import { trackSnsClick } from '@/shared/lib/analytics';
import type { SnsClickParams } from '@/shared/lib/analytics';

interface TrackedSnsLinkProps {
  /** 이동할 외부 SNS URL */
  href: string;
  /** SNS 플랫폼 식별자 */
  platform: SnsClickParams['sns_platform'];
  /** 클릭이 발생한 페이지 내 위치 */
  location: SnsClickParams['click_location'];
  children: React.ReactNode;
  className?: string;
  /** 스크린리더용 레이블 */
  ariaLabel?: string;
}

/**
 * SNS 외부 링크 클릭 이벤트를 추적하는 앵커 태그 래퍼.
 * 보안을 위해 target="_blank" + rel="noopener noreferrer"를 고정 적용한다.
 */
export default function TrackedSnsLink({
  href,
  platform,
  location,
  children,
  className,
  ariaLabel,
}: TrackedSnsLinkProps): React.ReactElement {
  function handleClick(): void {
    trackSnsClick({
      sns_platform: platform,
      click_location: location,
    });
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onClick={handleClick}
      className={className}
      aria-label={ariaLabel}
    >
      {children}
    </a>
  );
}
