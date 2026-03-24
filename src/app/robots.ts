import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: "/admin",
      },
      {
        userAgent: "Yeti",
        allow: "/",
      },
    ],
    sitemap: "https://www.cleaningclass.co.kr/sitemap.xml",
  };
}
