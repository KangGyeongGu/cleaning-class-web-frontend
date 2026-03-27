import { getSiteConfig } from "@/shared/lib/site-config";
import { InlineDescriptionEditor } from "@/app/admin/components/InlineDescriptionEditor";
import { updateServiceDescription } from "@/shared/actions/site-config";

export async function ServiceDescriptionSection(): Promise<React.ReactElement> {
  const siteConfig = await getSiteConfig();

  return (
    <InlineDescriptionEditor
      initialValue={siteConfig?.service_description ?? ""}
      placeholder="서비스 섹션 안내 문구를 입력하세요"
      emptyText="서비스 섹션 안내 문구가 없습니다."
      onSave={updateServiceDescription}
    />
  );
}
