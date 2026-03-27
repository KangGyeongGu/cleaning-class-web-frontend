"use client";

import { useActionState, useState } from "react";
import { Loader2, Check } from "lucide-react";
import { submitCustomerReview } from "@/shared/actions/customer-review";
import { StarRating } from "@/components/StarRating";

interface ReviewSubmitFormProps {
  token: string;
}

function StarRatingInput({
  value,
  onChange,
}: {
  value: number;
  onChange: (rating: number) => void;
}) {
  const [hovered, setHovered] = useState(0);

  const displayRating = hovered > 0 ? hovered : value;

  return (
    <div
      className="flex items-center gap-1"
      role="group"
      aria-label="별점 선택"
      onMouseLeave={() => setHovered(0)}
    >
      {Array.from({ length: 5 }, (_, i) => {
        const starValue = i + 1;
        const filled = starValue <= displayRating;
        return (
          <button
            key={starValue}
            type="button"
            aria-label={`${starValue}점`}
            aria-pressed={value === starValue}
            onClick={() => onChange(starValue)}
            onMouseEnter={() => setHovered(starValue)}
            className="cursor-pointer transition-transform hover:scale-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2"
          >
            <svg
              width={28}
              height={28}
              viewBox="0 0 20 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <path
                d="M10 1.667l2.575 5.217 5.758.838-4.166 4.063.983 5.732L10 14.583l-5.15 2.934.983-5.732L1.667 7.722l5.758-.838L10 1.667z"
                fill={filled ? "#0f172a" : "none"}
                stroke={filled ? "#0f172a" : "#cbd5e1"}
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        );
      })}
    </div>
  );
}

export function ReviewSubmitForm({ token }: ReviewSubmitFormProps) {
  const [state, formAction, isPending] = useActionState(
    submitCustomerReview,
    null,
  );
  const [rating, setRating] = useState(0);
  const [commentLength, setCommentLength] = useState(0);

  const isSuccess = state?.success === true;

  return (
    <form action={formAction} className="space-y-6">
      <input type="hidden" name="token" value={token} />
      {/* rating 값은 StarRatingInput이 시각적으로 제어, hidden input으로 서버에 전달 */}
      <input type="hidden" name="rating" value={rating} />

      <div>
        <p
          id="rating-label"
          className="mb-3 block text-sm font-medium text-slate-900"
        >
          서비스 만족도
          <span className="ml-1 text-red-500" aria-hidden="true">
            *
          </span>
        </p>
        <div aria-labelledby="rating-label">
          <StarRatingInput value={rating} onChange={setRating} />
        </div>
        {rating > 0 && (
          <p className="mt-2 text-xs text-slate-500">
            <StarRating
              rating={rating}
              size={12}
              className="mr-1 inline-flex"
            />
            <span className="sr-only">선택된 별점:</span>
            {rating}점
          </p>
        )}
        {state?.errors?.rating && (
          <p className="form-error mt-1">{state.errors.rating[0]}</p>
        )}
      </div>

      <div>
        <label
          htmlFor="comment"
          className="mb-2 block text-sm font-medium text-slate-900"
        >
          후기 내용
          <span className="ml-1 text-red-500" aria-hidden="true">
            *
          </span>
        </label>
        <textarea
          id="comment"
          name="comment"
          rows={5}
          maxLength={500}
          required
          placeholder="서비스 이용 후기를 남겨주세요"
          className="form-input scrollbar-thin resize-none overflow-y-auto"
          onInput={(e) => setCommentLength(e.currentTarget.value.length)}
        />
        <div className="mt-1 flex justify-end">
          <span className="text-xs text-slate-400">{commentLength}/500</span>
        </div>
        {state?.errors?.comment && (
          <p className="form-error">{state.errors.comment[0]}</p>
        )}
      </div>

      <div className="pt-2">
        {isSuccess ? (
          <div className="flex flex-col items-center gap-3 py-4 text-center">
            <div className="flex h-12 w-12 items-center justify-center border border-slate-200 text-slate-900">
              <Check className="h-5 w-5" />
            </div>
            <p className="text-sm font-medium text-slate-900">
              후기가 등록되었습니다. 감사합니다!
            </p>
            <p className="text-xs text-slate-500">
              소중한 후기는 더 나은 서비스를 만드는 데 큰 도움이 됩니다.
            </p>
          </div>
        ) : (
          <button
            type="submit"
            disabled={isPending || rating === 0}
            className="btn-primary w-full py-3"
          >
            {isPending ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                등록 중...
              </span>
            ) : (
              "후기 등록하기"
            )}
          </button>
        )}

        {state?.error && (
          <p className="form-error mt-4 text-center">{state.error}</p>
        )}
      </div>
    </form>
  );
}
