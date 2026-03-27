import { createServerClient } from "@supabase/ssr";
import type { Database } from "@/shared/types/database";

/**
 * 공개 읽기 전용 Supabase 클라이언트.
 * cookies() 미호출 → ISR/정적 생성 가능.
 * 관리자 인증이나 쓰기 작업에는 server.ts의 createClient()를 사용할 것.
 */
export function createStaticClient() {
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return [];
        },
        setAll() {},
      },
    },
  );
}
