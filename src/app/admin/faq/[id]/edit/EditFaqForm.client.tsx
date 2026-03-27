"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { updateFaq } from "@/shared/actions/faq";
import { Loader2 } from "lucide-react";
import type { FaqRow } from "@/shared/types/database";

interface EditFaqFormProps {
  faq: FaqRow;
}

export function EditFaqForm({ faq }: EditFaqFormProps) {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(
    updateFaq.bind(null, String(faq.id)),
    null,
  );

  useEffect(() => {
    if (state && "success" in state && state.success) {
      router.push("/admin/faq");
    }
  }, [state, router]);

  return (
    <form action={formAction} className="space-y-8">
      <div>
        <label htmlFor="question" className="form-label">
          질문 (최대 300자)
        </label>
        <textarea
          id="question"
          name="question"
          required
          maxLength={300}
          rows={3}
          defaultValue={faq.question}
          disabled={isPending}
          className="form-input-lg w-full resize-none disabled:opacity-50"
          placeholder="자주 묻는 질문을 입력하세요"
        ></textarea>
        {state && "errors" in state && state.errors?.question && (
          <p className="mt-1 text-xs text-red-500">
            {state.errors.question[0]}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="answer" className="form-label">
          답변 (최대 2000자)
        </label>
        <textarea
          id="answer"
          name="answer"
          required
          maxLength={2000}
          rows={8}
          defaultValue={faq.answer}
          disabled={isPending}
          className="form-input-lg w-full resize-none disabled:opacity-50"
          placeholder="답변을 입력하세요"
        ></textarea>
        {state && "errors" in state && state.errors?.answer && (
          <p className="mt-1 text-xs text-red-500">{state.errors.answer[0]}</p>
        )}
      </div>

      <div>
        <label htmlFor="display_order" className="form-label">
          표시 순서
        </label>
        <input
          id="display_order"
          name="display_order"
          type="number"
          min="0"
          defaultValue={faq.display_order}
          disabled={isPending}
          className="form-input-lg w-full disabled:opacity-50"
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
            defaultChecked={faq.is_active}
            disabled={isPending}
            className="h-5 w-5 disabled:opacity-50"
          />
          <label
            htmlFor="is_active"
            className="text-sm font-bold text-slate-900"
          >
            활성화
          </label>
        </div>
        <p className="mt-2 text-xs text-slate-400">
          체크 해제 시 홈페이지에 노출되지 않습니다.
        </p>
      </div>

      {state && "error" in state && state.error && (
        <p className="text-sm text-red-500">{state.error}</p>
      )}

      <div className="flex gap-4 pt-4">
        <button
          type="submit"
          disabled={isPending}
          className="btn-primary px-8 py-4 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isPending ? (
            <span className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" /> 수정 중...
            </span>
          ) : (
            "수정"
          )}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="btn-outline px-8 py-4"
        >
          취소
        </button>
      </div>
    </form>
  );
}
