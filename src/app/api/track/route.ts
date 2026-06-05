import { NextResponse } from "next/server";
import { createClient } from "@/shared/lib/supabase/server";
import {
  extractClientIp,
  hashIp,
  isRateLimited,
  isSearchBot,
} from "@/shared/lib/analytics-server";
import { trackRequestSchema } from "@/shared/lib/analytics-schema";

export async function POST(request: Request): Promise<NextResponse> {
  const userAgent = request.headers.get("user-agent");
  if (isSearchBot(userAgent)) {
    return new NextResponse(null, { status: 204 });
  }

  const secret = process.env.APP_SECRET;
  if (!secret) {
    return new NextResponse(null, { status: 204 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return new NextResponse(null, { status: 204 });
  }

  const parsed = trackRequestSchema.safeParse(body);
  if (!parsed.success) {
    return new NextResponse(null, { status: 204 });
  }

  const ip = extractClientIp(request.headers);
  const ipHash = hashIp(ip, secret);

  if (await isRateLimited(ipHash, parsed.data.event_type)) {
    return new NextResponse(null, { status: 204 });
  }

  const supabase = await createClient();
  await supabase.from("analytics_events").insert({
    event_type: parsed.data.event_type,
    event_payload: parsed.data.event_payload,
    path: parsed.data.path,
    ip_hash: ipHash,
    user_agent: userAgent,
  });

  return new NextResponse(null, { status: 204 });
}
