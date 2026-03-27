import type { Metadata } from "next";
import Link from "next/link";
import { getPublishedReviews } from "@/shared/lib/home";
import { generateBreadcrumbListJsonLd } from "@/shared/lib/json-ld";
import { ReviewsPageClient } from "@/app/(public)/reviews/ReviewsPageClient.client";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "작업후기",
  description:
    "청소클라쓰의 실제 작업후기를 확인하세요. 거주청소, 정기청소, 특수청소 등 다양한 작업 사례를 소개합니다.",
  openGraph: {
    title: "작업후기 | 청소클라쓰",
    description:
      "청소클라쓰의 실제 작업후기를 확인하세요. 거주청소, 정기청소, 특수청소 등 다양한 작업 사례를 소개합니다.",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "청소클라쓰 작업후기",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "작업후기 | 청소클라쓰",
    description:
      "청소클라쓰의 실제 작업후기를 확인하세요. 거주청소, 정기청소, 특수청소 등 다양한 작업 사례를 소개합니다.",
  },
};

export default async function ReviewsPage() {
  const reviews = await getPublishedReviews();

  const breadcrumbJsonLd = generateBreadcrumbListJsonLd([
    { name: "홈", url: "https://www.cleaningclass.co.kr" },
    { name: "작업후기", url: "https://www.cleaningclass.co.kr/reviews" },
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbJsonLd).replace(/</g, "\\u003c"),
        }}
      />

      <main className="min-h-screen bg-white">
        <section className="pt-12 md:pt-16">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <nav aria-label="현재 위치" className="mb-8">
              <ol className="flex items-center gap-2 text-xs text-slate-400">
                <li>
                  <Link
                    href="/"
                    className="transition-colors hover:text-slate-600"
                  >
                    홈
                  </Link>
                </li>
                <li aria-hidden="true">/</li>
                <li className="text-slate-900" aria-current="page">
                  작업후기
                </li>
              </ol>
            </nav>

            <h1 className="text-heading-1 mb-4">작업후기</h1>
            <p className="text-body-sm max-w-lg text-slate-500">
              실제 작업 현장의 비포&amp;애프터를 확인하세요.
              <br className="hidden sm:block" />
              청소 전후의 변화를 사진과 함께 기록합니다.
            </p>
          </div>
        </section>

        <section className="py-10 md:py-14">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <ReviewsPageClient reviews={reviews} />
          </div>
        </section>
      </main>
    </>
  );
}
