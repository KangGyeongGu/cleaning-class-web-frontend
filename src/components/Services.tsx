"use client";

import { motion } from 'motion/react';
import Image from 'next/image';

const services = [
  {
    title: '거주청소',
    desc: '머무는 공간, 쾌적함의 재발견.',
    img: '/images/services/residential.webp'
  },
  {
    title: '정기청소',
    desc: '비즈니스의 품격, 변함없는 관리.',
    img: '/images/services/regular.webp'
  },
  {
    title: '특수청소',
    desc: '특별한 공간, 전문적인 솔루션.',
    img: '/images/services/special.webp'
  },
  {
    title: '쓰레기집',
    desc: '혼돈에서 질서로, 완벽한 복원.',
    img: '/images/services/hoarding.webp'
  },
  {
    title: '상가청소',
    desc: '매장의 첫인상, 깨끗함의 시작.',
    img: '/images/services/commercial.webp'
  }
];

export function Services() {
  return (
    <section className="py-32 bg-white relative">
      <div className="container mx-auto px-4 max-w-7xl">
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-16 text-center"
        >
            <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">SERVICE</h2>
        </motion.div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 md:gap-8">
          {services.map((service) => (
            <motion.div
              key={service.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="group cursor-default"
            >
              <div className="aspect-[3/4] overflow-hidden mb-5 relative bg-slate-200 transition-all duration-500 ease-out group-hover:-translate-y-3 group-hover:shadow-2xl">
                <Image
                  src={service.img}
                  alt={service.title}
                  fill
                  sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 16vw"
                  className="object-cover transition-transform duration-700 ease-in-out group-hover:scale-110 filter grayscale group-hover:grayscale-0"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300" />
              </div>
              <div className="text-center px-1">
                <h3 className="text-base font-bold mb-2 text-slate-900 transition-transform duration-300 origin-center group-hover:scale-110 group-hover:text-black">
                  {service.title}
                </h3>
                <p className="text-slate-500 text-xs leading-tight font-medium transition-colors duration-300 group-hover:text-slate-800">
                  {service.desc}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
