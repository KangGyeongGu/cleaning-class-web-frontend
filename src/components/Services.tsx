import { getSiteConfig } from "@/shared/lib/site-config";
import { getPublishedServicesWithImageUrls } from "@/shared/lib/home";
import { generateServiceJsonLd } from "@/shared/lib/json-ld";
import { ServiceGrid } from "@/components/ServiceGrid";

export async function Services() {
  // 서비스 목록과 사이트 설정을 병렬 조회 (React cache()로 getSiteConfig 중복 요청 방지)
  const [servicesWithImageUrls, siteConfig] = await Promise.all([
    getPublishedServicesWithImageUrls(),
    getSiteConfig(),
  ]);

  if (!servicesWithImageUrls || servicesWithImageUrls.length === 0) {
    return null;
  }

  const serviceDescription = siteConfig?.service_description ?? undefined;

  // 서비스 JSON-LD를 이 컴포넌트에서 직접 주입
  const serviceJsonLd = generateServiceJsonLd(
    servicesWithImageUrls,
    siteConfig?.site_url,
  );

  return (
    <section id="services" className="relative bg-white py-16 md:py-32">
      {/* eslint-disable @eslint-react/dom/no-dangerously-set-innerhtml -- Service JSON-LD, 서버 생성 DB 데이터로 XSS 위험 없음 */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(serviceJsonLd).replace(/</g, "\\u003c"),
        }}
      />
      {/* eslint-enable @eslint-react/dom/no-dangerously-set-innerhtml */}
      <div className="container mx-auto max-w-7xl px-4">
        <div className="mb-16 text-center">
          <h2 className="mb-4 text-3xl font-black tracking-tight text-slate-900 md:text-4xl">
            SERVICE
          </h2>
          <p className="text-sm font-light tracking-wide text-slate-500 md:text-base">
            {serviceDescription ||
              "공간의 성격에 맞는 최적의 청소 서비스를 제공합니다."}
          </p>
        </div>

        <ServiceGrid services={servicesWithImageUrls} />
      </div>
    </section>
  );
}
