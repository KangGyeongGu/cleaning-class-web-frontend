"use client";

import { useState, useTransition } from "react";
import { Loader2, Copy, Check, Trash2, Plus } from "lucide-react";
import {
  generateReviewToken,
  deleteReviewToken,
} from "@/shared/actions/customer-review";
import type { ReviewTokenRow, CustomerReviewRow } from "@/shared/types/database";

// ─────────────────────────────────────────────────────────────────────────────
// 별점 표시 컴포넌트 (관리자 전용 소형 버전)
// ─────────────────────────────────────────────────────────────────────────────

function StarDisplay({ rating }: { rating: number }) {
  return (
    <span className="flex items-center gap-0.5" aria-label={`별점 ${rating}점`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <svg
          key={i}
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

// ─────────────────────────────────────────────────────────────────────────────
// 클립보드 복사 버튼
// ─────────────────────────────────────────────────────────────────────────────

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

// ─────────────────────────────────────────────────────────────────────────────
// 토큰 삭제 버튼
// ─────────────────────────────────────────────────────────────────────────────

function DeleteTokenButton({ tokenId }: { tokenId: string }) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleDelete() {
    if (!confirm("이 토큰을 삭제하시겠습니까? 연결된 리뷰가 없는 경우에만 삭제됩니다.")) return;

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

// ─────────────────────────────────────────────────────────────────────────────
// 토큰 생성 버튼
// ─────────────────────────────────────────────────────────────────────────────

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
        onClick={handleGenerate}
        disabled={isPending}
        className="inline-flex items-center gap-2 bg-slate-900 px-5 py-2.5 text-sm font-bold tracking-widest text-white transition-colors hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
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

// ─────────────────────────────────────────────────────────────────────────────
// 날짜 포맷 헬퍼
// ─────────────────────────────────────────────────────────────────────────────

function formatDate(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// 토큰 목록 섹션
// ─────────────────────────────────────────────────────────────────────────────

interface TokenListSectionProps {
  tokens: ReviewTokenRow[];
}

export function TokenListSection({ tokens }: TokenListSectionProps) {
  const origin = typeof window !== "undefined" ? window.location.origin : "";

  return (
    <section>
      {/* 섹션 헤더 — 토큰 생성 버튼 포함 */}
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-900">리뷰 링크 토큰</h2>
          <p className="mt-0.5 text-xs font-light text-slate-500">
            생성된 링크를 고객에게 전달하면 별점 리뷰를 등록할 수 있습니다. 유효기간 30일.
          </p>
        </div>
        <GenerateTokenButton />
      </div>

      {tokens.length === 0 ? (
        <div className="border border-slate-100 p-8 text-center">
          <p className="text-sm font-light text-slate-400">
            생성된 토큰이 없습니다. 위 버튼으로 토큰을 생성하세요.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
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
              {tokens.map((token) => {
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
                    {/* 토큰 URL — 잘라서 표시 후 복사 버튼 */}
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
      )}
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 고객 리뷰 목록 섹션
// ─────────────────────────────────────────────────────────────────────────────

interface CustomerReviewsListProps {
  reviews: CustomerReviewRow[];
}

export function CustomerReviewsList({ reviews }: CustomerReviewsListProps) {
  return (
    <section>
      <div className="mb-4">
        <h2 className="text-lg font-bold text-slate-900">제출된 고객 리뷰</h2>
        <p className="mt-0.5 text-xs font-light text-slate-500">
          고객이 토큰 링크를 통해 등록한 별점 리뷰 목록입니다.
        </p>
      </div>

      {reviews.length === 0 ? (
        <div className="border border-slate-100 p-8 text-center">
          <p className="text-sm font-light text-slate-400">
            아직 제출된 리뷰가 없습니다.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="py-3 pr-4 text-left text-xs font-bold tracking-widest text-slate-500 uppercase">
                  별점
                </th>
                <th className="py-3 pr-4 text-left text-xs font-bold tracking-widest text-slate-500 uppercase">
                  내용
                </th>
                <th className="py-3 text-left text-xs font-bold tracking-widest text-slate-500 uppercase">
                  등록일
                </th>
              </tr>
            </thead>
            <tbody>
              {reviews.map((review) => (
                <tr
                  key={review.id}
                  className="border-b border-slate-100 last:border-0"
                >
                  <td className="py-3 pr-4">
                    <div className="flex items-center gap-2">
                      <StarDisplay rating={review.rating} />
                      <span className="text-xs font-light text-slate-400">
                        {review.rating}점
                      </span>
                    </div>
                  </td>
                  <td className="py-3 pr-4 font-light text-slate-700">
                    <p className="max-w-md leading-relaxed">{review.comment}</p>
                  </td>
                  <td className="py-3 text-sm font-light text-slate-400">
                    {formatDate(review.created_at)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
