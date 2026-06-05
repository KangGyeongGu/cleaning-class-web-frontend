import "server-only";
import { createHash } from "node:crypto";
import { createClient } from "@/shared/lib/supabase/server";
import type { EventType } from "@/shared/lib/analytics-schema";

const SEARCH_BOT_PATTERNS = [
  /googlebot/i,
  /bingbot/i,
  /yeti/i,
  /duckduckbot/i,
  /yandexbot/i,
  /baiduspider/i,
  /applebot/i,
  /facebookexternalhit/i,
];

const RATE_LIMIT_WINDOW_SECONDS = 60;
const RATE_LIMIT_MAX_EVENTS = 5;

export function hashIp(ip: string, secret: string): string {
  return createHash("sha256").update(`${ip}:${secret}`).digest("hex");
}

export function isSearchBot(userAgent: string | null): boolean {
  if (!userAgent) return false;
  return SEARCH_BOT_PATTERNS.some((p) => p.test(userAgent));
}

export async function isRateLimited(
  ipHash: string,
  eventType: EventType,
): Promise<boolean> {
  const supabase = await createClient();
  const sinceIso = new Date(
    Date.now() - RATE_LIMIT_WINDOW_SECONDS * 1000,
  ).toISOString();

  const { count, error } = await supabase
    .from("analytics_events")
    .select("id", { count: "exact", head: true })
    .eq("ip_hash", ipHash)
    .eq("event_type", eventType)
    .gte("created_at", sinceIso);

  if (error) return false;
  return (count ?? 0) >= RATE_LIMIT_MAX_EVENTS;
}

export function extractClientIp(headers: Headers): string {
  const forwardedFor = headers.get("x-forwarded-for");
  if (forwardedFor) return forwardedFor.split(",")[0].trim();
  const realIp = headers.get("x-real-ip");
  if (realIp) return realIp.trim();
  return "0.0.0.0";
}
