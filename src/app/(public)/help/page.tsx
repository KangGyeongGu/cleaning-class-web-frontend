// 공개 고객센터 페이지 — composition-only (데이터 페칭은 FaqSection 서버 컴포넌트가 담당)
import type { Metadata } from "next";
import { generateBreadcrumbListJsonLd } from "@/shared/lib/json-ld";
import { FaqSection } from "@/components/FaqSection";

export const metadata: Metadata = {
  title: "고객센터",
  description:
    "청소클라쓰 고객센터 — 청소 예약, 서비스 지역, 결제 방법 등 자주 묻는 질문(FAQ) 안내",
  alternates: {
    canonical: "https://www.cleaningclass.co.kr/help",
  },
  openGraph: {
    title: "고객센터 | 청소클라쓰",
    description:
      "청소클라쓰 고객센터 — 청소 예약, 서비스 지역, 결제 방법 등 자주 묻는 질문(FAQ) 안내",
    url: "https://www.cleaningclass.co.kr/help",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "청소클라쓰 고객센터",
      },
    ],
  },
};

// BreadcrumbList JSON-LD — 홈 → 고객센터 경로 구조화 (정적 데이터로 page.tsx에 유지)
const breadcrumbJsonLd = generateBreadcrumbListJsonLd([
  { name: "홈", url: "https://www.cleaningclass.co.kr" },
  { name: "고객센터", url: "https://www.cleaningclass.co.kr/help" },
]);

export default function HelpPage() {
  return (
    <article className="mx-auto max-w-3xl px-6 pt-16 pb-20 md:pt-20 md:pb-24">
      {/* eslint-disable @eslint-react/dom/no-dangerously-set-innerhtml -- BreadcrumbList JSON-LD, 서버 생성 정적 데이터로 XSS 위험 없음 */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbJsonLd).replace(/</g, "\\u003c"),
        }}
      />
      {/* eslint-enable @eslint-react/dom/no-dangerously-set-innerhtml */}

      {/* 페이지 제목 */}
      <h1 className="mb-4 text-3xl font-black tracking-tighter text-slate-900">
        고객센터
      </h1>

      {/* FAQ 섹션 — 데이터 조회·JSON-LD·아코디언을 처리하는 서버 컴포넌트 */}
      <FaqSection />
    </article>
  );
}
