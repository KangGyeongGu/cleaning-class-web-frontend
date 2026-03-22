"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";

const BLUR_PLACEHOLDER =
  "data:image/webp;base64,UklGRlYAAABXRUJQVlA4IEoAAADQAQCdASoIAAUAAkA4JZQCdAEO/hepgAAA/vxLOv98KRk4BgLv/5P/AOiV/wPYpn+N1Vf/UYx1Z//0YSz6Le/+igAAAA==";

export interface ServiceCardProps {
  service: {
    title: string;
    description: string;
    imageUrl: string;
    afterImageUrl?: string;
    focalX?: number;
    focalY?: number;
    afterFocalX?: number;
    afterFocalY?: number;
  };
  priority: boolean;
  /** 부모에서 동기화된 before/after 토글 (모바일 전용) */
  showAfter?: boolean;
}

export function ServiceCard({ service, priority, showAfter = false }: ServiceCardProps) {
  const [isVisible, setIsVisible] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  // IntersectionObserver: 진입 애니메이션 (1회)
  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observer.disconnect();
          }
        }
      },
      { threshold: 0.1 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={cardRef}
      className={`group cursor-default pb-4 md:pb-0 transition-all duration-600 ease-out ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
      }`}
    >
      <div className="aspect-square md:aspect-3/4 overflow-hidden mb-3 md:mb-5 relative bg-slate-200 transition-all duration-500 ease-out group-hover:-translate-y-3 group-hover:shadow-2xl">
        {service.afterImageUrl ? (
          <>
            <Image
              src={service.imageUrl}
              alt={`${service.title} Before`}
              fill
              sizes="(max-width: 768px) calc(50vw - 8px), (max-width: 1024px) 33vw, 20vw"
              priority={priority}
              placeholder="blur"
              blurDataURL={BLUR_PLACEHOLDER}
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
              sizes="(max-width: 768px) calc(50vw - 8px), (max-width: 1024px) 33vw, 20vw"
              placeholder="blur"
              blurDataURL={BLUR_PLACEHOLDER}
              className={`object-cover absolute inset-0 transition-opacity duration-700 ease-in-out opacity-0 group-hover:opacity-100 ${
                showAfter ? "opacity-100!" : ""
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
            sizes="(max-width: 768px) calc(50vw - 8px), (max-width: 1024px) 33vw, 20vw"
            priority={priority}
            placeholder="blur"
            blurDataURL={BLUR_PLACEHOLDER}
            className="object-cover transition-transform duration-700 ease-in-out group-hover:scale-110 filter grayscale group-hover:grayscale-0"
            style={{
              objectPosition: `${service.focalX ?? 50}% ${service.focalY ?? 50}%`,
            }}
          />
        )}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300" />
      </div>
      <div className="text-center px-1">
        <h3 className="text-base font-bold mb-2 text-slate-900 transition-all duration-300 origin-center group-hover:scale-110 group-hover:text-black">
          {service.title}
        </h3>
        <p className="text-slate-600 text-sm leading-tight font-medium transition-colors duration-300 group-hover:text-slate-800">
          {service.description}
        </p>
      </div>
    </div>
  );
}
