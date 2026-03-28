'use client';

/**
 * 서버 컴포넌트에서 사용할 전화번호 링크 클라이언트 래퍼.
 * 클릭 시 GA4 generate_lead(phone_click) 이벤트를 발화한 뒤 기본 tel: 동작을 유지한다.
 */

import { trackPhoneClick } from '@/shared/lib/analytics';
import type { PhoneClickLocation } from '@/shared/lib/analytics';

interface TrackedPhoneLinkProps
  extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  /** tel: 형식의 href (예: "tel:010-1234-5678") */
  href: string;
  /** 전화 유형 — 청소/이사 구분 */
  phoneType: 'cleaning' | 'moving';
  /** 클릭이 발생한 페이지 내 위치 */
  location: PhoneClickLocation;
  children: React.ReactNode;
}

/**
 * 전화번호 클릭 이벤트를 추적하는 앵커 태그 래퍼.
 * href, phoneType, location을 제외한 나머지 앵커 속성은 그대로 전달된다.
 */
export default function TrackedPhoneLink({
  href,
  phoneType,
  location,
  children,
  ...rest
}: TrackedPhoneLinkProps): React.ReactElement {
  function handleClick(): void {
    trackPhoneClick({
      currency: 'KRW',
      value: 0,
      lead_source: 'phone_click',
      phone_type: phoneType,
      click_location: location,
    });
  }

  return (
    <a href={href} onClick={handleClick} {...rest}>
      {children}
    </a>
  );
}
