/**
 * FAQ 목록 섹션 서버 컴포넌트
 * FAQ 데이터를 조회하여 FaqListClient에 전달합니다.
 */

import { getAllFaqs } from "@/shared/lib/queries/faq";
import { FaqListClient } from "@/app/admin/faq/FaqListClient.client";

export async function FaqListSection(): Promise<React.ReactElement> {
  const faqs = await getAllFaqs();

  if (faqs.length === 0) {
    return (
      <div className="border border-slate-200 p-12 text-center">
        <p className="font-light text-slate-500">등록된 FAQ가 없습니다.</p>
      </div>
    );
  }

  return <FaqListClient faqs={faqs} />;
}
