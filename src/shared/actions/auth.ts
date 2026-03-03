"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/shared/lib/supabase/server";
import { loginFormSchema } from "@/shared/lib/schema";

type LoginState = {
  error?: string;
};

/**
 * 관리자 로그인 Server Action
 * REQ-FILE-008, REQ-FUNC-001
 */
export async function login(prevState: LoginState | null, formData: FormData): Promise<LoginState> {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  // Zod 검증
  const result = loginFormSchema.safeParse({ email, password });

  if (!result.success) {
    return {
      error: result.error.errors[0].message,
    };
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email: result.data.email,
    password: result.data.password,
  });

  if (error) {
    return {
      error: "이메일 또는 비밀번호가 올바르지 않습니다.",
    };
  }

  // 로그인 성공 시 /admin 리다이렉트
  redirect("/admin");
}

/**
 * 관리자 로그아웃 Server Action
 * REQ-FUNC-001
 */
export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}
