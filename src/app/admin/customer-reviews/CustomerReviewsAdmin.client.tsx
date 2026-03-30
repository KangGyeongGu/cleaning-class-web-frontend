"use client";

import { useState, useEffect, useTransition, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Loader2,
  Copy,
  Check,
  Trash2,
  Plus,
  ChevronLeft,
  ChevronRight,
  Eye,
  EyeOff,
} from "lucide-react";
import {
  generateReviewToken,
  deleteReviewToken,
  deleteCustomerReview,
  toggleCustomerReviewPublish,
} from "@/shared/actions/customer-review";
import type {
  ReviewTokenRow,
  CustomerReviewRow,
} from "@/shared/types/database";

/** 관리자 전용 소형 별점 표시 */
function StarDisplay({ rating }: { rating: number }) {
  return (
    <span className="flex items-center gap-0.5" aria-label={`별점 ${rating}점`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <svg
          key={`star-${i}`}
          className={`h-3.5 w-3.5 ${i < rating ? "text-slate-900" : "text-slate-200"}`}
          fill="currentColor"
          viewBox="0 0 20 20"
          aria-hidden="true"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </span>
  );
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // 클립보드 API 실패 시 무시
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="inline-flex items-center gap-1 text-xs text-slate-500 transition-colors hover:text-slate-900"
      title="링크 복사"
    >
      {copied ? (
        <>
          <Check className="h-3.5 w-3.5" />
          복사됨
        </>
      ) : (
        <>
          <Copy className="h-3.5 w-3.5" />
          복사
        </>
      )}
    </button>
  );
}

function DeleteTokenButton({ tokenId }: { tokenId: string }) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleDelete() {
    if (
      !confirm(
        "이 토큰을 삭제하시겠습니까? 연결된 리뷰가 없는 경우에만 삭제됩니다.",
      )
    )
      return;

    startTransition(async () => {
      const result = await deleteReviewToken(tokenId);
      if (!result.success) {
        setError(result.error ?? "삭제 중 오류가 발생했습니다.");
      } else {
        setError(null);
      }
    });
  }

  return (
    <div>
      <button
        type="button"
        onClick={handleDelete}
        disabled={isPending}
        className="inline-flex items-center text-slate-400 transition-colors hover:text-red-500 disabled:cursor-not-allowed disabled:opacity-50"
        title="토큰 삭제"
      >
        {isPending ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Trash2 className="h-4 w-4" />
        )}
      </button>
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}

function GenerateTokenButton() {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleGenerate() {
    startTransition(async () => {
      const result = await generateReviewToken();
      if (!result.success) {
        setError(result.error ?? "토큰 생성 중 오류가 발생했습니다.");
      } else {
        setError(null);
      }
    });
  }

  return (
    <div>
      <button
        type="button"
        onClick={handleGenerate}
        disabled={isPending}
        className="inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap bg-slate-900 px-3 py-2 text-xs font-bold text-white transition-colors hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70 md:gap-2 md:px-5 md:py-2.5 md:text-sm md:tracking-widest"
      >
        {isPending ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Plus className="h-4 w-4" />
        )}
        토큰 생성
      </button>
      {error && <p className="mt-2 text-xs text-red-500">{error}</p>}
    </div>
  );
}

function formatDate(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

interface TokenListSectionProps {
  tokens: ReviewTokenRow[];
}

const TOKENS_PER_PAGE = 10;

function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}: {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) {
  if (totalPages <= 1) return null;

  return (
    <div className="mt-4 flex items-center justify-center gap-1">
      <button
        type="button"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="flex h-8 w-8 items-center justify-center rounded text-slate-400 transition-colors hover:bg-slate-100 disabled:pointer-events-none disabled:opacity-30"
      >
        <ChevronLeft size={16} />
      </button>
      <span className="px-3 text-xs tabular-nums text-slate-500">
        {currentPage} / {totalPages}
      </span>
      <button
        type="button"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="flex h-8 w-8 items-center justify-center rounded text-slate-400 transition-colors hover:bg-slate-100 disabled:pointer-events-none disabled:opacity-30"
      >
        <ChevronRight size={16} />
      </button>
    </div>
  );
}

function getTokenStatus(token: ReviewTokenRow, now: number): { label: string; className: string } {
  if (token.is_used) return { label: "사용됨", className: "text-slate-400" };
  if (new Date(token.expires_at).getTime() < now) return { label: "만료됨", className: "text-red-400" };
  return { label: "미사용", className: "text-green-600" };
}

export function TokenListSection({ tokens }: TokenListSectionProps) {
  const [origin, setOrigin] = useState("");
  const [now, setNow] = useState(0);

  useEffect(() => {
    setOrigin(window.location.origin);
    setNow(Date.now());
    // eslint-disable-next-line react-hooks/exhaustive-deps -- 마운트 시 1회만 실행
  }, []);
  const [tokenPage, setTokenPage] = useState(1);
  const tokenTotalPages = Math.ceil(tokens.length / TOKENS_PER_PAGE);
  const pagedTokens = useMemo(
    () =>
      tokens.slice(
        (tokenPage - 1) * TOKENS_PER_PAGE,
        tokenPage * TOKENS_PER_PAGE,
      ),
    [tokens, tokenPage],
  );

  return (
    <section>
      <div className="mb-4">
        <div className="flex items-start justify-between gap-3 md:items-center">
          <h2 className="text-base font-bold text-slate-900 md:text-lg">리뷰 링크 토큰</h2>
          <GenerateTokenButton />
        </div>
        <p className="mt-1 text-[11px] font-light text-slate-500 md:text-xs">
          생성된 링크를 고객에게 전달하면 별점 리뷰를 등록할 수 있습니다.
          유효기간 30일. ({tokens.length}건)
        </p>
      </div>

      {tokens.length === 0 ? (
        <div className="border border-slate-100 p-8 text-center">
          <p className="text-sm font-light text-slate-400">
            생성된 토큰이 없습니다. 위 버튼으로 토큰을 생성하세요.
          </p>
        </div>
      ) : (
        <>
          {/* 모바일: 카드 레이아웃 */}
          <div className="space-y-3 md:hidden">
            {pagedTokens.map((token) => {
              const tokenUrl = `${origin}/review/${token.token}`;
              const status = getTokenStatus(token, now);

              return (
                <div
                  key={token.id}
                  className="rounded-lg border border-slate-100 p-4"
                >
                  <div className="mb-2 flex items-center justify-between">
                    <span className={`text-xs font-bold ${status.className}`}>
                      {status.label}
                    </span>
                    <DeleteTokenButton tokenId={token.id} />
                  </div>
                  <div className="mb-2 flex items-center gap-2">
                    <span className="truncate font-mono text-xs text-slate-500">
                      {tokenUrl}
                    </span>
                    <CopyButton text={tokenUrl} />
                  </div>
                  <div className="flex gap-4 text-xs text-slate-400">
                    <span>생성: {formatDate(token.created_at)}</span>
                    <span>만료: {formatDate(token.expires_at)}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* 데스크톱: 테이블 레이아웃 */}
          <div className="hidden overflow-x-auto md:block">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="py-3 pr-4 text-left text-xs font-bold tracking-widest text-slate-500 uppercase">
                    링크
                  </th>
                  <th className="py-3 pr-4 text-left text-xs font-bold tracking-widest text-slate-500 uppercase">
                    생성일
                  </th>
                  <th className="py-3 pr-4 text-left text-xs font-bold tracking-widest text-slate-500 uppercase">
                    만료일
                  </th>
                  <th className="py-3 pr-4 text-left text-xs font-bold tracking-widest text-slate-500 uppercase">
                    상태
                  </th>
                  <th className="py-3 text-right text-xs font-bold tracking-widest text-slate-500 uppercase">
                    삭제
                  </th>
                </tr>
              </thead>
              <tbody>
                {pagedTokens.map((token) => {
                  const tokenUrl = `${origin}/review/${token.token}`;
                  const isExpired = new Date(token.expires_at) < new Date();
                  const statusLabel = token.is_used
                    ? "사용됨"
                    : isExpired
                      ? "만료됨"
                      : "미사용";
                  const statusClass = token.is_used
                    ? "text-slate-400"
                    : isExpired
                      ? "text-red-400"
                      : "text-green-600";

                  return (
                    <tr
                      key={token.id}
                      className="border-b border-slate-100 last:border-0"
                    >
                      <td className="py-3 pr-4 font-light text-slate-600">
                        <div className="flex items-center gap-2">
                          <span className="max-w-xs truncate font-mono text-xs text-slate-500">
                            {tokenUrl}
                          </span>
                          <CopyButton text={tokenUrl} />
                        </div>
                      </td>
                      <td className="py-3 pr-4 font-light text-slate-500">
                        {formatDate(token.created_at)}
                      </td>
                      <td className="py-3 pr-4 font-light text-slate-500">
                        {formatDate(token.expires_at)}
                      </td>
                      <td className="py-3 pr-4">
                        <span className={`text-xs font-bold ${statusClass}`}>
                          {statusLabel}
                        </span>
                      </td>
                      <td className="py-3 text-right">
                        <DeleteTokenButton tokenId={token.id} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <Pagination
            currentPage={tokenPage}
            totalPages={tokenTotalPages}
            onPageChange={setTokenPage}
          />
        </>
      )}
    </section>
  );
}

function ReviewCardMobile({ review }: { review: CustomerReviewRow }) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  return (
    <div className="rounded-lg border border-slate-100 p-4">
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <StarDisplay rating={review.rating} />
          <span className="text-xs text-slate-400">{review.rating}점</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() =>
              startTransition(async () => {
                await toggleCustomerReviewPublish(
                  review.id,
                  !review.is_published,
                );
                router.refresh();
              })
            }
            disabled={isPending}
            className="inline-flex items-center gap-1 text-xs text-slate-400"
          >
            {review.is_published ? <Eye size={12} /> : <EyeOff size={12} />}
            <span>{review.is_published ? "공개" : "비공개"}</span>
          </button>
          <button
            type="button"
            onClick={() => {
              if (!confirm("이 리뷰를 삭제하시겠습니까?")) return;
              startTransition(async () => {
                await deleteCustomerReview(review.id);
                router.refresh();
              });
            }}
            disabled={isPending}
            className="text-slate-400 hover:text-red-500"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
      <p className="mb-2 text-sm leading-relaxed text-slate-700">
        {review.comment}
      </p>
      <div className="flex items-center justify-between text-xs text-slate-400">
        <span>{review.service_type ?? "-"}</span>
        <span>{formatDate(review.created_at)}</span>
      </div>
    </div>
  );
}

function ReviewRowDesktop({ review }: { review: CustomerReviewRow }) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  return (
    <tr className="border-b border-slate-100 last:border-0">
      <td className="py-3 pr-4">
        <div className="flex items-center gap-2">
          <StarDisplay rating={review.rating} />
          <span className="text-xs font-light text-slate-400">
            {review.rating}점
          </span>
        </div>
      </td>
      <td className="py-3 pr-4 text-xs text-slate-400">
        {review.service_type ?? "-"}
      </td>
      <td className="py-3 pr-4 font-light text-slate-700">
        <p className="max-w-md leading-relaxed">{review.comment}</p>
      </td>
      <td className="py-3 pr-4 text-center">
        <button
          type="button"
          onClick={() =>
            startTransition(async () => {
              await toggleCustomerReviewPublish(
                review.id,
                !review.is_published,
              );
              router.refresh();
            })
          }
          disabled={isPending}
          className="inline-flex items-center gap-1 text-xs font-bold text-slate-500 transition-colors hover:text-slate-900 disabled:opacity-50"
        >
          {isPending ? (
            <Loader2 size={14} className="animate-spin" />
          ) : review.is_published ? (
            <Eye size={14} />
          ) : (
            <EyeOff size={14} />
          )}
          {review.is_published ? "공개" : "비공개"}
        </button>
      </td>
      <td className="py-3 pr-4 text-sm font-light text-slate-400">
        {formatDate(review.created_at)}
      </td>
      <td className="py-3 text-right">
        <button
          type="button"
          onClick={() => {
            if (!confirm("이 리뷰를 삭제하시겠습니까?")) return;
            startTransition(async () => {
              await deleteCustomerReview(review.id);
            });
          }}
          disabled={isPending}
          className="text-slate-400 transition-colors hover:text-red-500 disabled:opacity-50"
        >
          {isPending ? (
            <Loader2 size={14} className="animate-spin" />
          ) : (
            <Trash2 size={14} />
          )}
        </button>
      </td>
    </tr>
  );
}

interface CustomerReviewsListProps {
  reviews: CustomerReviewRow[];
}

const REVIEWS_PER_PAGE = 10;

export function CustomerReviewsList({ reviews: initialReviews }: CustomerReviewsListProps) {
  const [reviews, setReviews] = useState(initialReviews);
  // eslint-disable-next-line -- props→state 동기화: router.refresh() 후 서버 데이터 반영
  useEffect(() => setReviews(initialReviews), [initialReviews]);
  const [reviewPage, setReviewPage] = useState(1);
  const reviewTotalPages = Math.ceil(reviews.length / REVIEWS_PER_PAGE);
  const pagedReviews = useMemo(
    () =>
      reviews.slice(
        (reviewPage - 1) * REVIEWS_PER_PAGE,
        reviewPage * REVIEWS_PER_PAGE,
      ),
    [reviews, reviewPage],
  );

  return (
    <section>
      <div className="mb-4">
        <h2 className="text-lg font-bold text-slate-900">제출된 고객 리뷰</h2>
        <p className="mt-0.5 text-xs font-light text-slate-500">
          고객이 토큰 링크를 통해 등록한 별점 리뷰 목록입니다. ({reviews.length}
          건)
        </p>
      </div>

      {reviews.length === 0 ? (
        <div className="border border-slate-100 p-8 text-center">
          <p className="text-sm font-light text-slate-400">
            아직 제출된 리뷰가 없습니다.
          </p>
        </div>
      ) : (
        <>
          {/* 모바일: 카드 레이아웃 */}
          <div className="space-y-3 md:hidden">
            {pagedReviews.map((review) => (
              <ReviewCardMobile key={review.id} review={review} />
            ))}
          </div>

          {/* 데스크톱: 테이블 레이아웃 */}
          <div className="hidden overflow-x-auto md:block">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="py-3 pr-4 text-left text-xs font-bold tracking-widest text-slate-500 uppercase">
                    별점
                  </th>
                  <th className="py-3 pr-4 text-left text-xs font-bold tracking-widest text-slate-500 uppercase">
                    서비스
                  </th>
                  <th className="py-3 pr-4 text-left text-xs font-bold tracking-widest text-slate-500 uppercase">
                    내용
                  </th>
                  <th className="py-3 pr-4 text-center text-xs font-bold tracking-widest text-slate-500 uppercase">
                    공개
                  </th>
                  <th className="py-3 pr-4 text-left text-xs font-bold tracking-widest text-slate-500 uppercase">
                    등록일
                  </th>
                  <th className="py-3 text-right text-xs font-bold tracking-widest text-slate-500 uppercase">
                    삭제
                  </th>
                </tr>
              </thead>
              <tbody>
                {pagedReviews.map((review) => (
                  <ReviewRowDesktop key={review.id} review={review} />
                ))}
              </tbody>
            </table>
          </div>
          <Pagination
            currentPage={reviewPage}
            totalPages={reviewTotalPages}
            onPageChange={setReviewPage}
          />
        </>
      )}
    </section>
  );
}
