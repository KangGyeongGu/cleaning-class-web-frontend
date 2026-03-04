/**
 * Schema.org LocalBusiness JSON-LD 생성
 * @see https://schema.org/LocalBusiness
 * @see https://schema.org/CleaningService
 */

import type { SiteConfig } from '@/shared/types/database';

interface LocalBusinessJsonLd {
  "@context": "https://schema.org";
  "@type": ["CleaningService", "LocalBusiness"];
  name: string;
  description: string;
  url: string;
  address: {
    "@type": "PostalAddress";
    addressRegion: string;
    addressLocality: string;
    addressCountry: string;
  };
  areaServed: {
    "@type": "Place";
    name: string;
  };
  serviceType: string[];
  priceRange: string;
}

export function generateLocalBusinessJsonLd(siteConfig?: SiteConfig | null): LocalBusinessJsonLd {
  return {
    "@context": "https://schema.org",
    "@type": ["CleaningService", "LocalBusiness"],
    name: siteConfig?.business_name ?? "청소클라쓰",
    description: siteConfig?.description ?? "전북 전주 지역 전문 청소 서비스 - 거주청소, 정기청소, 특수청소, 쓰레기집, 상가청소",
    url: siteConfig?.site_url ?? "https://www.cleaningclass.co.kr",
    address: {
      "@type": "PostalAddress",
      addressRegion: siteConfig?.address_region ?? "전라북도",
      addressLocality: siteConfig?.address_locality ?? "전주시",
      addressCountry: "KR",
    },
    areaServed: {
      "@type": "Place",
      name: `${siteConfig?.address_region ?? "전북"} ${siteConfig?.address_locality ?? "전주"}`,
    },
    serviceType: ["거주청소", "정기청소", "특수청소", "쓰레기집청소", "상가청소"],
    priceRange: "$$",
  };
}
