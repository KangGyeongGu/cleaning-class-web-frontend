/**
 * 서비스 목록 섹션 서버 컴포넌트
 * 서비스 데이터를 조회하여 ServiceListClient에 전달합니다.
 */

import { getServices } from "@/shared/lib/queries/service";
import { ServiceListClient } from "@/app/admin/services/ServiceListClient";

export async function ServiceListSection(): Promise<React.ReactElement> {
  const servicesWithImageUrls = await getServices();

  if (servicesWithImageUrls.length === 0) {
    return (
      <div className="border border-slate-200 p-12 text-center">
        <p className="font-light text-slate-500">등록된 서비스가 없습니다.</p>
      </div>
    );
  }

  return <ServiceListClient services={servicesWithImageUrls} />;
}
