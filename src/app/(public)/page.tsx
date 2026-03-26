import type { Metadata } from "next";
import { Suspense } from "react";
import { Hero } from "@/components/Hero";
import { Services } from "@/components/Services";
import { BlogReviewsSection } from "@/components/BlogReviewsSection";
import { ContactSection } from "@/components/ContactSection";
import { buildDescription } from "@/shared/lib/format";

// ISR: 1시간마다 재검증
export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const title = "전주 청소업체 청소클라쓰 | 전북 전주 전문 청소 서비스";
  const description = buildDescription();

  return {
    title: {
      absolute: title,
    },
    description,
    openGraph: {
      title,
      description,
      images: [
        {
          url: "/opengraph-image",
          width: 1200,
          height: 630,
          alt: "청소클라쓰",
        },
      ],
    },
  };
}

// 섹션별 로딩 스켈레톤 — Suspense 경계로 스트리밍 렌더링 지원
function ServicesSkeleton() {
  return (
    <div className="py-16 md:py-32">
      <div className="mx-auto max-w-7xl animate-pulse px-6">
        <div className="mx-auto mb-8 h-8 w-48 rounded bg-slate-200" />
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="h-64 rounded bg-slate-200" />
          <div className="h-64 rounded bg-slate-200" />
          <div className="h-64 rounded bg-slate-200" />
        </div>
      </div>
    </div>
  );
}

function ReviewsSkeleton() {
  return (
    <div className="py-16 md:py-32">
      <div className="mx-auto max-w-7xl animate-pulse px-6">
        <div className="mx-auto mb-8 h-8 w-48 rounded bg-slate-200" />
        <div className="h-64 rounded bg-slate-200" />
      </div>
    </div>
  );
}

function ContactSkeleton() {
  return (
    <div className="py-16 md:py-32">
      <div className="mx-auto max-w-7xl animate-pulse px-6">
        <div className="mx-auto mb-8 h-8 w-48 rounded bg-slate-200" />
        <div className="mb-4 h-12 rounded bg-slate-200" />
        <div className="mb-4 h-12 rounded bg-slate-200" />
        <div className="mb-4 h-32 rounded bg-slate-200" />
        <div className="h-12 w-32 rounded bg-slate-200" />
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <div className="min-h-screen bg-white font-sans text-slate-900 selection:bg-slate-900 selection:text-white">
      <Suspense>
        <Hero />
      </Suspense>
      <Suspense fallback={<ServicesSkeleton />}>
        <Services />
      </Suspense>
      <Suspense fallback={<ReviewsSkeleton />}>
        <BlogReviewsSection />
      </Suspense>
      <Suspense fallback={<ContactSkeleton />}>
        <ContactSection />
      </Suspense>
    </div>
  );
}
