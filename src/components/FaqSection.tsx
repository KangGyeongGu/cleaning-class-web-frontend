// FAQ 섹션 서버 컴포넌트 — 데이터 조회, faqDescription 결정, FAQPage JSON-LD 주입을 담당
// page.tsx가 데이터 페칭 없이 composition-only 역할을 유지할 수 있도록 분리
import { getActiveFaqs } from "@/shared/lib/queries/faq";
import { getSiteConfig } from "@/shared/lib/site-config";
import { generateFaqPageJsonLd } from "@/shared/lib/json-ld";
import { FaqAccordion } from "@/components/FaqAccordion";

const DEFAULT_FAQ_DESCRIPTION =
  "청소클라쓰에 궁금한 점이 있으시면 아래 자주 묻는 질문을 확인해 주세요. 추가 문의는 홈페이지 견적문의를 이용해 주시면 빠르게 답변드립니다.";

export async function FaqSection() {
  // FAQ 목록과 사이트 설정을 병렬 조회하여 응답 지연 최소화
  const [faqs, siteConfig] = await Promise.all([
    getActiveFaqs(),
    getSiteConfig(),
  ]);

  const faqDescription =
    siteConfig?.faq_description?.trim() || DEFAULT_FAQ_DESCRIPTION;

  // DB FAQ 데이터 기반 FAQPage JSON-LD 생성
  const faqPageJsonLd = generateFaqPageJsonLd(
    faqs.map((faq) => ({ question: faq.question, answer: faq.answer })),
  );

  return (
    <>
      {/* eslint-disable @eslint-react/dom/no-dangerously-set-innerhtml -- FAQPage JSON-LD, DB FAQ 데이터 기반. < → \u003c 치환으로 XSS 방어 */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(faqPageJsonLd).replace(/</g, "\\u003c"),
        }}
      />
      {/* eslint-enable @eslint-react/dom/no-dangerously-set-innerhtml */}

      {/* FAQ 설명 및 목록 섹션 */}
      <p className="mb-16 text-sm leading-relaxed font-light text-slate-600">
        {faqDescription}
      </p>

      <section aria-labelledby="faq-heading">
        <h2 id="faq-heading" className="mb-8 text-lg font-bold text-slate-900">
          자주 묻는 질문
        </h2>
        <FaqAccordion faqs={faqs} />
      </section>
    </>
  );
}
