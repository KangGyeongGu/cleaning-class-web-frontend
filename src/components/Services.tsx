"use client";

import { useState, useEffect } from "react";
import { motion } from "motion/react";
import Image from "next/image";

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

function ServiceCard({
  service,
  priority,
}: {
  service: ServiceItem;
  priority: boolean;
}) {
  const [showAfter, setShowAfter] = useState(false);

  useEffect(() => {
    if (!service.afterImageUrl) return;

    const mq = window.matchMedia("(hover: none)");
    if (!mq.matches) return;

    const interval = setInterval(() => {
      setShowAfter((prev) => !prev);
    }, 3000);

    return () => clearInterval(interval);
  }, [service.afterImageUrl]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="group cursor-default pb-4 md:pb-0"
    >
      <div className="aspect-square md:aspect-[3/4] overflow-hidden mb-3 md:mb-5 relative bg-slate-200 transition-all duration-500 ease-out group-hover:-translate-y-3 group-hover:shadow-2xl">
        {service.afterImageUrl ? (
          <>
            <Image
              src={service.imageUrl}
              alt={`${service.title} Before`}
              fill
              sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 16vw"
              priority={priority}
              className={`object-cover grayscale transition-opacity duration-700 ease-in-out group-hover:opacity-0 ${
                showAfter ? "opacity-0" : ""
              }`}
              style={{
                objectPosition: `${service.focalX ?? 50}% ${service.focalY ?? 50}%`,
              }}
            />
            <Image
              src={service.afterImageUrl}
              alt={`${service.title} After`}
              fill
              sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 16vw"
              className={`object-cover absolute inset-0 transition-opacity duration-700 ease-in-out group-hover:opacity-100 ${
                showAfter ? "opacity-100" : "opacity-0"
              }`}
              style={{
                objectPosition: `${service.afterFocalX ?? 50}% ${service.afterFocalY ?? 50}%`,
              }}
            />
          </>
        ) : (
          <Image
            src={service.imageUrl}
            alt={service.title}
            fill
            sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 16vw"
            priority={priority}
            className="object-cover transition-transform duration-700 ease-in-out group-hover:scale-110 filter grayscale group-hover:grayscale-0"
            style={{
              objectPosition: `${service.focalX ?? 50}% ${service.focalY ?? 50}%`,
            }}
          />
        )}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300" />
      </div>
      <div className="text-center px-1">
        <h3 className="text-base font-bold mb-2 text-slate-900 transition-transform duration-300 origin-center group-hover:scale-110 group-hover:text-black">
          {service.title}
        </h3>
        <p className="text-slate-500 text-xs leading-tight font-medium transition-colors duration-300 group-hover:text-slate-800">
          {service.description}
        </p>
      </div>
    </motion.div>
  );
}

export function Services({ services, serviceDescription }: ServicesProps) {
  if (!services || services.length === 0) {
    return null;
  }

  return (
    <section id="services" className="py-32 bg-white relative">
      <div className="container mx-auto px-4 max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-16 text-center"
        >
          <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight mb-4">
            SERVICE
          </h2>
          <p className="text-slate-500 text-sm md:text-base font-light tracking-wide">
            {serviceDescription ||
              "공간의 성격에 맞는 최적의 청소 서비스를 제공합니다."}
          </p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-8">
          {services.map((service, index) => (
            <ServiceCard
              key={service.id}
              service={service}
              priority={index === 0}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
