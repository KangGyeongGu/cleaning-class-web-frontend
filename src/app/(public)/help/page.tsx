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

      <h1 className="mb-4 text-3xl font-black tracking-tighter text-slate-900">
        고객센터
      </h1>

      <FaqSection />
    </article>
  );
}
