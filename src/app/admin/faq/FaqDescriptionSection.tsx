import { getSiteConfig } from "@/shared/lib/site-config";
import { InlineDescriptionEditor } from "@/app/admin/components/InlineDescriptionEditor";
import { updateFaqDescription } from "@/shared/actions/site-config";

export async function FaqDescriptionSection(): Promise<React.ReactElement> {
  const siteConfig = await getSiteConfig();

  return (
    <InlineDescriptionEditor
      initialValue={siteConfig?.faq_description ?? ""}
      placeholder="고객센터 페이지 안내 문구를 입력하세요"
      emptyText="고객센터 페이지 안내 문구가 없습니다."
      onSave={updateFaqDescription}
    />
  );
}
