"use client";

import { trackPhoneClick } from "@/shared/lib/analytics";
import type { PhoneClickLocation } from "@/shared/lib/analytics";
import { track } from "@/shared/lib/track";

interface TrackedPhoneLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string;
  phoneType: "cleaning" | "moving";
  location: PhoneClickLocation;
  children: React.ReactNode;
}

export default function TrackedPhoneLink({
  href,
  phoneType,
  location,
  children,
  ...rest
}: TrackedPhoneLinkProps): React.ReactElement {
  function handleClick(): void {
    trackPhoneClick({
      currency: "KRW",
      value: 0,
      lead_source: "phone_click",
      phone_type: phoneType,
      click_location: location,
    });
    track({
      event_type: "phone_click",
      event_payload: { phone_type: phoneType, click_location: location },
      path: typeof window !== "undefined" ? window.location.pathname : "/",
    });
  }

  return (
    <a href={href} onClick={handleClick} {...rest}>
      {children}
    </a>
  );
}
