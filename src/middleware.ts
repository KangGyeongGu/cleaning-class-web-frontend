import { updateSession } from "@/shared/lib/supabase/middleware";
import type { NextRequest } from "next/server";

/**
 * 관리자 영역(/admin) 인증 보호 미들웨어
 * REQ-FILE-009, REQ-FUNC-002
 */
export async function middleware(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: ["/admin/:path*"],
};
