import { createClient } from "@/shared/lib/supabase/server";

/**
 * 현재 인증된 사용자 확인
 * Server Action에서 공통으로 사용하는 인증 검증 유틸리티
 * @throws 인증되지 않은 경우 에러 발생
 */
export async function getUser() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    throw new Error("인증이 필요합니다.");
  }

  return user;
}
