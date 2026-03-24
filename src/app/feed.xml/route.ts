import { getSiteConfig } from "@/shared/lib/site-config";
import type { SiteConfig } from "@/shared/types/database";

export const revalidate = 3600;

const SITE_URL = "https://www.cleaningclass.co.kr";
const FEED_URL = `${SITE_URL}/feed.xml`;

function escapeXml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function buildRssFeed(config: SiteConfig | null): string {
  const channelTitle = config?.business_name ?? "청소클라쓰";
  const channelDescription =
    config?.description ?? "전북 지역 전문 청소 서비스, 청소클라쓰";
  const channelLink = config?.site_url ?? SITE_URL;
  const lastBuildDate = new Date().toUTCString();

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(channelTitle)}</title>
    <link>${escapeXml(channelLink)}</link>
    <description>${escapeXml(channelDescription)}</description>
    <language>ko</language>
    <lastBuildDate>${lastBuildDate}</lastBuildDate>
    <atom:link href="${FEED_URL}" rel="self" type="application/rss+xml"/>
    <item>
      <title>${escapeXml(channelTitle)}</title>
      <link>${escapeXml(channelLink)}</link>
      <guid>${escapeXml(channelLink)}</guid>
      <description>${escapeXml(channelDescription)}</description>
      <pubDate>${lastBuildDate}</pubDate>
    </item>
  </channel>
</rss>`;
}

export async function GET(): Promise<Response> {
  const config = await getSiteConfig();
  const xml = buildRssFeed(config);

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "s-maxage=3600",
    },
  });
}
