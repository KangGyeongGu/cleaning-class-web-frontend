import { createClient } from "@/shared/lib/supabase/server";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = requestUrl.searchParams.get("next") ?? "/admin";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // next 파라미터 오픈 리다이렉트 차단: URL 파싱 후 origin 비교로 외부 도메인 리다이렉트 방지
      let safeNext = "/admin";
      try {
        const parsedUrl = new URL(next, request.url);
        if (parsedUrl.origin === request.nextUrl.origin) {
          safeNext = next;
        }
      } catch {
        /* 빈 catch: 파싱 실패 시 safeNext 기본값("/admin") 유지 */
      }
      return NextResponse.redirect(new URL(safeNext, request.url));
    }
  }

  return NextResponse.redirect(new URL("/admin/login", request.url));
}
