import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // 관리자 페이지 및 토큰 기반 개별 리뷰 페이지 크롤링 차단
      disallow: ["/admin", "/review/"],
    },
    sitemap: "https://www.cleaningclass.co.kr/sitemap.xml",
  };
}
