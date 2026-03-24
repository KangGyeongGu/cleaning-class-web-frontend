import { ServiceGrid } from "@/components/ServiceGrid";

interface ServiceItem {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  afterImageUrl?: string;
  focalX?: number;
  focalY?: number;
  afterFocalX?: number;
  afterFocalY?: number;
}

interface ServicesProps {
  services: ServiceItem[];
  serviceDescription?: string;
}

export function Services({ services, serviceDescription }: ServicesProps) {
  if (!services || services.length === 0) {
    return null;
  }

  return (
    <section id="services" className="relative bg-white py-16 md:py-32">
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

        <ServiceGrid services={services} />
      </div>
    </section>
  );
}
