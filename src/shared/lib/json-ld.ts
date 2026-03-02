/**
 * Schema.org LocalBusiness JSON-LD 생성
 * @see https://schema.org/LocalBusiness
 * @see https://schema.org/CleaningService
 */

interface LocalBusinessJsonLd {
  "@context": "https://schema.org";
  "@type": "LocalBusiness";
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

export function generateLocalBusinessJsonLd(): LocalBusinessJsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: "청소클라쓰",
    description: "전북 전주 지역 전문 청소 서비스 - 입주청소, 이사청소, 사무실청소, 거주청소",
    url: "https://www.cleaningclass.co.kr",
    address: {
      "@type": "PostalAddress",
      addressRegion: "전라북도",
      addressLocality: "전주시",
      addressCountry: "KR",
    },
    areaServed: {
      "@type": "Place",
      name: "전북 전주",
    },
    serviceType: ["입주청소", "이사청소", "사무실청소", "거주청소"],
    priceRange: "$$",
  };
}
