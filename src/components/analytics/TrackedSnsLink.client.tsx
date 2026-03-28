'use client';

import { trackSnsClick } from '@/shared/lib/analytics';
import type { SnsClickParams } from '@/shared/lib/analytics';

interface TrackedSnsLinkProps {
  href: string;
  platform: SnsClickParams['sns_platform'];
  location: SnsClickParams['click_location'];
  children: React.ReactNode;
  className?: string;
  ariaLabel?: string;
}

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
    // 외부 링크 보안을 위해 rel="noopener noreferrer" 고정 적용
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
