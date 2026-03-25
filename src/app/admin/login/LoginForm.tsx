"use client";

import { useState } from "react";
import { useActionState } from "react";
import { login } from "@/shared/actions/auth";
import { Eye, EyeOff, Loader2 } from "lucide-react";

export function LoginForm() {
  const [state, formAction, isPending] = useActionState(login, null);
  // 비밀번호 표시/숨기기 상태
  const [showPassword, setShowPassword] = useState<boolean>(false);

  return (
    <div className="flex min-h-screen items-center justify-center bg-white px-4">
      <div className="w-full max-w-md">
        <h1 className="mb-2 text-center text-4xl font-black text-slate-900">
          청소클라쓰
        </h1>
        <p className="mb-12 text-center font-light text-slate-500">
          관리자 로그인
        </p>

        <form action={formAction} className="space-y-8">
          <div>
            <label
              htmlFor="email"
              className="mb-3 block text-xs font-bold tracking-widest text-slate-900 uppercase"
            >
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="w-full border-b border-slate-200 bg-transparent pb-3 text-lg font-light transition-colors outline-none placeholder:text-slate-300 focus:border-slate-900"
              placeholder="이메일을 입력하세요"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-3 block text-xs font-bold tracking-widest text-slate-900 uppercase"
            >
              Password
            </label>
            {/* 비밀번호 입력 필드 + 표시/숨기기 토글 버튼 래퍼 */}
            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                required
                autoComplete="current-password"
                className="w-full border-b border-slate-200 bg-transparent pb-3 pr-10 text-lg font-light transition-colors outline-none placeholder:text-slate-300 focus:border-slate-900"
                placeholder="비밀번호를 입력하세요"
              />
              {/* 비밀번호 표시/숨기기 토글 버튼 */}
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={showPassword ? "비밀번호 숨기기" : "비밀번호 표시"}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition-colors hover:text-slate-700 focus:outline-none"
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5" aria-hidden="true" />
                ) : (
                  <Eye className="h-5 w-5" aria-hidden="true" />
                )}
              </button>
            </div>
          </div>

          {state?.error && (
            <p className="text-sm text-red-500">{state.error}</p>
          )}

          <button
            type="submit"
            disabled={isPending}
            className="w-full bg-slate-900 px-8 py-4 text-sm font-bold tracking-widest text-white transition-colors hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isPending ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" /> 로그인 중...
              </span>
            ) : (
              "로그인"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
