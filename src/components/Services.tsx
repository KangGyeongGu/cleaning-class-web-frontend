import { motion } from 'motion/react';
import { ImageWithFallback } from './figma/ImageWithFallback';

const services = [
  {
    title: '거주 청소',
    desc: '머무는 공간, 쾌적함의 재발견.',
    img: 'https://images.unsplash.com/photo-1653242370243-5f7ca54b00db?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBtaW5pbWFsJTIwbGl2aW5nJTIwcm9vbSUyMHdoaXRlJTIwYnJpZ2h0fGVufDF8fHx8MTc3MjI1MjIzMHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral'
  },
  {
    title: '입주 청소',
    desc: '설레는 시작, 결점 없는 공간.',
    img: 'https://images.unsplash.com/photo-1762810951632-68c9f197cf33?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlbXB0eSUyMGNsZWFuJTIwYXBhcnRtZW50JTIwd2hpdGUlMjBicmlnaHR8ZW58MXx8fHwxNzcyMjUyMjMxfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral'
  },
  {
    title: '정기 청소',
    desc: '비즈니스의 품격, 변함없는 관리.',
    img: 'https://images.unsplash.com/photo-1603980494048-32be7640c11f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjB3aGl0ZSUyMG9mZmljZSUyMGludGVyaW9yJTIwbWluaW1hbHxlbnwxfHx8fDE3NzIyNTIyMzF8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral'
  },
  {
    title: '원룸 청소',
    desc: '나만의 공간, 작지만 완벽하게.',
    img: 'https://images.unsplash.com/photo-1722764385076-ffaf499e5a7c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzbWFsbCUyMGNvenklMjBtb2Rlcm4lMjBzdHVkaW8lMjBhcGFydG1lbnQlMjB3aGl0ZXxlbnwxfHx8fDE3NzIyNTIyMzF8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral'
  },
  {
    title: '쓰레기집 청소',
    desc: '혼돈에서 질서로, 완벽한 복원.',
    img: 'https://images.unsplash.com/photo-1721396181215-e2af0b235290?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwZXJmZWN0bHklMjBvcmdhbml6ZWQlMjB3aGl0ZSUyMHJvb20lMjBtaW5pbWFsfGVufDF8fHx8MTc3MjI1MjIzMXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral'
  },
  {
    title: '부분 청소',
    desc: '필요한 곳만, 집중적인 케어.',
    img: 'https://images.unsplash.com/photo-1765766556463-180500e61ea8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjB3aGl0ZSUyMGJhdGhyb29tJTIwY2xlYW4lMjBkZXRhaWx8ZW58MXx8fHwxNzcyMjUyMjMxfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral'
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
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 md:gap-8">
          {services.map((service, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05, duration: 0.6 }}
              className="group cursor-default"
            >
              <div className="aspect-[3/4] overflow-hidden mb-5 relative bg-slate-100 transition-all duration-500 ease-out group-hover:-translate-y-3 group-hover:shadow-2xl">
                <ImageWithFallback 
                  src={service.img} 
                  alt={service.title} 
                  className="w-full h-full object-cover transition-transform duration-700 ease-in-out group-hover:scale-110 filter grayscale group-hover:grayscale-0"
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
