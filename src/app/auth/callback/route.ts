import { createClient } from "@/shared/lib/supabase/server";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Supabase 인증 콜백 Route Handler
 * OAuth 또는 이메일 링크 인증 후 세션 교환 처리
 * REQ-FILE-010, REQ-PAGE-007
 */
export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = requestUrl.searchParams.get("next") ?? "/admin";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // next 파라미터 오픈 리다이렉트 차단: /로 시작하고 //로 시작하지 않는 상대 경로만 허용
      const safeNext =
        next.startsWith("/") && !next.startsWith("//") ? next : "/admin";
      return NextResponse.redirect(new URL(safeNext, request.url));
    }
  }

  // 인증 실패 시 로그인 페이지로 리다이렉트
  return NextResponse.redirect(new URL("/admin/login", request.url));
}
