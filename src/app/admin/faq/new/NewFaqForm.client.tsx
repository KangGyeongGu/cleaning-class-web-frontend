"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createFaq } from "@/shared/actions/faq";
import { Loader2 } from "lucide-react";

interface NewFaqFormProps {
  defaultDisplayOrder?: number;
}

export function NewFaqForm({ defaultDisplayOrder = 0 }: NewFaqFormProps) {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(createFaq, null);

  useEffect(() => {
    if (state && "success" in state && state.success) {
      router.push("/admin/faq");
    }
  }, [state, router]);

  return (
    <form action={formAction} className="space-y-8">
      <div>
        <label
          htmlFor="question"
          className="mb-3 block text-xs font-bold tracking-widest text-slate-900 uppercase"
        >
          질문 (최대 300자)
        </label>
        <textarea
          id="question"
          name="question"
          required
          maxLength={300}
          rows={3}
          disabled={isPending}
          className="w-full resize-none border-b border-slate-200 bg-transparent pb-3 text-lg font-light transition-colors outline-none placeholder:text-slate-300 focus:border-slate-900 disabled:opacity-50"
          placeholder="자주 묻는 질문을 입력하세요"
        ></textarea>
        {state && "errors" in state && state.errors?.question && (
          <p className="mt-1 text-xs text-red-500">
            {state.errors.question[0]}
          </p>
        )}
      </div>

      <div>
        <label
          htmlFor="answer"
          className="mb-3 block text-xs font-bold tracking-widest text-slate-900 uppercase"
        >
          답변 (최대 2000자)
        </label>
        <textarea
          id="answer"
          name="answer"
          required
          maxLength={2000}
          rows={8}
          disabled={isPending}
          className="w-full resize-none border-b border-slate-200 bg-transparent pb-3 text-lg font-light transition-colors outline-none placeholder:text-slate-300 focus:border-slate-900 disabled:opacity-50"
          placeholder="답변을 입력하세요"
        ></textarea>
        {state && "errors" in state && state.errors?.answer && (
          <p className="mt-1 text-xs text-red-500">{state.errors.answer[0]}</p>
        )}
      </div>

      <div>
        <label
          htmlFor="display_order"
          className="mb-3 block text-xs font-bold tracking-widest text-slate-900 uppercase"
        >
          표시 순서
        </label>
        <input
          id="display_order"
          name="display_order"
          type="number"
          min="0"
          defaultValue={defaultDisplayOrder}
          disabled={isPending}
          className="w-full border-b border-slate-200 bg-transparent pb-3 text-lg font-light transition-colors outline-none focus:border-slate-900 disabled:opacity-50"
        />
        {state && "errors" in state && state.errors?.display_order && (
          <p className="mt-1 text-xs text-red-500">
            {state.errors.display_order[0]}
          </p>
        )}
      </div>

      <div>
        <div className="flex items-center gap-3">
          <input
            id="is_active"
            name="is_active"
            type="checkbox"
            value="true"
            defaultChecked
            disabled={isPending}
            className="h-5 w-5 disabled:opacity-50"
          />
          <label
            htmlFor="is_active"
            className="text-sm font-bold text-slate-900"
          >
            즉시 활성화
          </label>
        </div>
        <p className="mt-2 text-xs text-slate-400">
          체크 해제 시 저장만 되고 홈페이지에 노출되지 않습니다.
        </p>
      </div>

      {state && "error" in state && state.error && (
        <p className="text-sm text-red-500">{state.error}</p>
      )}

      <div className="flex gap-4 pt-4">
        <button
          type="submit"
          disabled={
            isPending || !!(state && "success" in state && state.success)
          }
          className="bg-slate-900 px-8 py-4 text-sm font-bold tracking-widest text-white transition-colors hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isPending ? (
            <span className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" /> 등록 중...
            </span>
          ) : (
            "등록"
          )}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="border border-slate-900 px-8 py-4 text-sm font-bold tracking-widest text-slate-900 transition-colors hover:bg-slate-900 hover:text-white"
        >
          취소
        </button>
      </div>
    </form>
  );
}
