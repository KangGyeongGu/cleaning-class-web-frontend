// 별점 표시 컴포넌트 — 인라인 SVG 사용으로 아이콘 라이브러리 의존 없이 재사용 가능
// 서버 컴포넌트로 동작하며 "use client" 불필요

interface StarRatingProps {
  rating: number;
  size?: number;
  className?: string;
}

export function StarRating({
  rating,
  size = 16,
  className = "",
}: StarRatingProps): React.ReactElement {
  return (
    <div
      className={`flex items-center gap-0.5 ${className}`}
      aria-label={`별점 ${rating}점 / 5점`}
      role="img"
    >
      {Array.from({ length: 5 }, (_, i) => {
        // 채워진 별: rating 이하, 빈 별: rating 초과
        const filled = i < Math.round(rating);
        return (
          <svg
            key={i}
            width={size}
            height={size}
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
        );
      })}
    </div>
  );
}
