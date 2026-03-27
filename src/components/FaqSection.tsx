import { getActiveFaqs } from "@/shared/lib/queries/faq";
import { generateFaqPageJsonLd } from "@/shared/lib/json-ld";
import { FaqAccordion } from "@/components/FaqAccordion";

export async function FaqSection() {
  const faqs = await getActiveFaqs();

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

      <section aria-labelledby="faq-heading">
        <h2 id="faq-heading" className="text-heading-1 mb-8">
          자주 묻는 질문
        </h2>
        <FaqAccordion faqs={faqs} />
      </section>
    </>
  );
}
