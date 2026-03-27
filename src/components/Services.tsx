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

  const serviceJsonLd = generateServiceJsonLd(
    servicesWithImageUrls,
    siteConfig?.site_url,
  );

  const cleaningServices = servicesWithImageUrls.filter(
    (s) => s.category === "cleaning",
  );
  const movingServices = servicesWithImageUrls.filter(
    (s) => s.category === "moving",
  );

  const cleaningPhone = siteConfig?.phone ?? "010-6711-2964";
  const movingPhone = siteConfig?.moving_phone ?? "010-3654-0102";

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
      <div className="container mx-auto max-w-7xl px-4 md:px-8 lg:px-12">
        <div className="mb-16 text-center">
          <h2 className="text-heading-1 mb-4">SERVICE</h2>
          <p className="text-body-sm tracking-wide text-slate-500 md:text-base">
            {serviceDescription ||
              "공간의 성격에 맞는 최적의 서비스를 제공합니다."}
          </p>
        </div>

        {/* 청소 서비스 */}
        {cleaningServices.length > 0 && (
          <div className="mb-16 md:mb-24">
            <div className="mb-8">
              <p className="mb-1 text-xs font-bold uppercase tracking-widest text-slate-400">
                Cleaning
              </p>
              <h3 className="text-lg font-black tracking-tight text-slate-900">
                청소 서비스
              </h3>
            </div>
            <ServiceGrid services={cleaningServices} phone={cleaningPhone} />
          </div>
        )}

        {/* 이사 서비스 */}
        {movingServices.length > 0 && (
          <div>
            <div className="mb-8">
              <p className="mb-1 text-xs font-bold uppercase tracking-widest text-slate-400">
                Moving
              </p>
              <h3 className="text-lg font-black tracking-tight text-slate-900">
                이사 서비스
              </h3>
            </div>
            <ServiceGrid services={movingServices} phone={movingPhone} />
          </div>
        )}
      </div>
    </section>
  );
}
