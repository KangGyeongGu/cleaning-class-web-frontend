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
    <section id="services" className="py-16 md:py-32 bg-white relative">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="mb-16 text-center">
          <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight mb-4">
            SERVICE
          </h2>
          <p className="text-slate-500 text-sm md:text-base font-light tracking-wide">
            {serviceDescription ||
              "공간의 성격에 맞는 최적의 청소 서비스를 제공합니다."}
          </p>
        </div>

        <ServiceGrid services={services} />
      </div>
    </section>
  );
}
