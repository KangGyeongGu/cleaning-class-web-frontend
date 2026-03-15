"use client";

import { useActionState } from "react";
import { login } from "@/shared/actions/auth";
import { Loader2 } from "lucide-react";

export function LoginForm() {
  const [state, formAction, isPending] = useActionState(login, null);

  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-4">
      <div className="w-full max-w-md">
        <h1 className="text-4xl font-black text-slate-900 mb-2 text-center">
          청소클라쓰
        </h1>
        <p className="text-center text-slate-500 font-light mb-12">
          관리자 로그인
        </p>

        <form action={formAction} className="space-y-8">
          <div>
            <label
              htmlFor="email"
              className="block text-xs font-bold text-slate-900 uppercase tracking-widest mb-3"
            >
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="w-full pb-3 bg-transparent border-b border-slate-200 focus:border-slate-900 transition-colors outline-none text-lg font-light placeholder:text-slate-300"
              placeholder="이메일을 입력하세요"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-xs font-bold text-slate-900 uppercase tracking-widest mb-3"
            >
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              className="w-full pb-3 bg-transparent border-b border-slate-200 focus:border-slate-900 transition-colors outline-none text-lg font-light placeholder:text-slate-300"
              placeholder="비밀번호를 입력하세요"
            />
          </div>

          {state?.error && (
            <p className="text-red-500 text-sm">{state.error}</p>
          )}

          <button
            type="submit"
            disabled={isPending}
            className="w-full px-8 py-4 bg-slate-900 text-white font-bold text-sm tracking-widest hover:bg-slate-800 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isPending ? (
              <span className="flex items-center gap-2 justify-center">
                <Loader2 className="animate-spin w-4 h-4" /> 로그인 중...
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
