import { motion } from 'motion/react';
import { ArrowLeft, ArrowRight, ArrowUpRight } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import Slider, { type CustomArrowProps } from "react-slick";

const reviews = [
  {
    id: 1,
    title: '전주 에코시티 34평 입주청소 현장',
    summary: '신축 아파트 입주 전 필수 코스. 공사 분진 제거부터 피톤치드까지.',
    tags: ['#입주청소', '#전주'],
    img: 'https://images.unsplash.com/photo-1770086962001-3da4f60e7db5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzaGlueSUyMGNsZWFuJTIwbWFyYmxlJTIwZmxvb3IlMjBsaXZpbmclMjByb29tfGVufDF8fHx8MTc3MDQ1ODI1OHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral'
  },
  {
    id: 2,
    title: '군산 수송동 상가 유리창 청소',
    summary: '매장의 얼굴은 유리창입니다. 투명한 시야를 찾아드렸습니다.',
    tags: ['#상가청소', '#군산'],
    img: 'https://images.unsplash.com/photo-1768425237744-c25411b14e98?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjbGVhbiUyMHdpbmRvdyUyMGdsYXNzJTIwdmlldyUyMGJsdWUlMjBza3l8ZW58MXx8fHwxNzcwNDU4MjU4fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral'
  },
  {
    id: 3,
    title: '익산 영등동 원룸 이사청소',
    summary: '이전 세입자의 흔적 지우기. 악취 제거와 곰팡이 박멸.',
    tags: ['#이사청소', '#익산'],
    img: 'https://images.unsplash.com/photo-1765766556463-180500e61ea8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBjbGVhbiUyMGJhdGhyb29tJTIwd2hpdGUlMjBpbnRlcmlvcnxlbnwxfHx8fDE3NzA0NTgyNTh8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral'
  },
  {
    id: 4,
    title: '시스템 에어컨 완전 분해 세척',
    summary: '고압 세척기로 냉각핀 사이사이 곰팡이와 먼지를 완벽 제거.',
    tags: ['#에어컨청소', '#분해세척'],
    img: 'https://images.unsplash.com/photo-1740422960726-9f495f37090b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkaXNhc3NlbWJsZWQlMjBhaXIlMjBjb25kaXRpb25lciUyMGNsZWFuaW5nJTIwcGFydHN8ZW58MXx8fHwxNzcwNDU4MjU5fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral'
  },
  {
    id: 5,
    title: '전주 효자동 빌라 쓰레기집 청소',
    summary: '오랫동안 방치된 쓰레기와 오염물 처리. 새 집처럼 복구 완료.',
    tags: ['#쓰레기집', '#특수청소'],
    img: 'https://images.unsplash.com/photo-1584622050111-993a426fbf0a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjbGVhbiUyMHVtcHR5JTIwcm9vbSUyMHdpdGglMjB3b29kZW4lMjBmbG9vcnxlbnwxfHx8fDE3NzA0NTgyNTh8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral'
  },
  {
    id: 6,
    title: '군산 미장동 아파트 부분 청소',
    summary: '주방 후드 기름때와 화장실 곰팡이 집중 케어.',
    tags: ['#부분청소', '#주방청소'],
    img: 'https://images.unsplash.com/photo-1556911220-e6d1a11582e7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfH2NsZWFuJTIwa2l0Y2hlbiUyMHdoaXRlJTIwbW9kZXJufGVufDF8fHx8MTc3MDQ1ODI1OHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral'
  }
];

function NextArrow(props: CustomArrowProps) {
  const { onClick } = props;
  return (
    <div
      className="absolute top-1/2 -right-4 md:-right-8 lg:-right-12 z-20 w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-full bg-white border border-slate-200 hover:border-slate-900 hover:bg-slate-900 text-slate-900 hover:text-white transition-all shadow-lg cursor-pointer transform -translate-y-1/2"
      onClick={onClick}
    >
      <ArrowRight className="w-5 h-5" />
    </div>
  );
}

function PrevArrow(props: CustomArrowProps) {
  const { onClick } = props;
  return (
    <div
      className="absolute top-1/2 -left-4 md:-left-8 lg:-left-12 z-20 w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-full bg-white border border-slate-200 hover:border-slate-900 hover:bg-slate-900 text-slate-900 hover:text-white transition-all shadow-lg cursor-pointer transform -translate-y-1/2"
      onClick={onClick}
    >
      <ArrowLeft className="w-5 h-5" />
    </div>
  );
}

export function BlogReviews() {
  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 4,
    slidesToScroll: 1,
    nextArrow: <NextArrow />,
    prevArrow: <PrevArrow />,
    responsive: [
      {
        breakpoint: 1280,
        settings: {
          slidesToShow: 3,
        }
      },
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 3,
        }
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 2,
        }
      },
      {
        breakpoint: 640,
        settings: {
          slidesToShow: 1,
          arrows: false // 모바일에서는 화살표 숨김 (터치 스와이프가 더 자연스러움)
        }
      }
    ]
  };

  return (
    <section className="py-32 bg-white relative overflow-hidden">
      <div className="container mx-auto px-12 md:px-20 lg:px-24 max-w-8xl">
        <div className="flex flex-col md:flex-row justify-between items-end mb-20 px-2">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-4 tracking-tight">
              REVIEW
            </h2>
            <p className="text-slate-500 text-sm md:text-base font-light tracking-wide max-w-lg">
              의뢰 전 업체의 작업 방식을 확인할 수 있는 후기들을 확인해보세요.
            </p>
          </motion.div>
          
          <motion.a 
            href="https://blog.naver.com/tmdrn0110" 
            target="_blank" 
            rel="noopener noreferrer"
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="hidden md:flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors text-sm font-medium tracking-wide"
          >
            VIEW BLOG <ArrowUpRight size={16} />
          </motion.a>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="relative px-2" // 슬라이더 컨테이너에 약간의 패딩 추가
        >
          <Slider {...settings}>
            {reviews.map((review) => (
              <div key={review.id} className="px-3 py-4"> {/* 카드 상하 패딩 추가 (호버 시 그림자 잘림 방지) */}
                <a
                  href="https://blog.naver.com/tmdrn0110"
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="group block border border-slate-200 rounded-xl overflow-hidden hover:border-slate-400 hover:shadow-xl transition-all duration-300 h-full bg-white"
                >
                  {/* Image Section */}
                  <div className="aspect-[4/3] overflow-hidden mb-5 bg-slate-50 relative">
                     <ImageWithFallback 
                      src={review.img} 
                      alt={review.title} 
                      className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                    />
                  </div>
                  
                  {/* Content Section */}
                  <div className="px-5 pb-6">
                    <h3 className="text-lg font-bold mb-3 text-slate-900 leading-snug group-hover:text-slate-700 transition-colors line-clamp-2 min-h-[3.2em]">
                      {review.title}
                    </h3>
                    
                    <p className="text-slate-500 text-sm leading-relaxed line-clamp-2 mb-4 h-[2.5em] font-light">
                      {review.summary}
                    </p>

                    <div className="flex flex-wrap gap-2 mb-6 h-[2.5em] overflow-hidden">
                      {review.tags.map(tag => (
                        <span key={tag} className="text-[10px] uppercase tracking-wider text-slate-400 bg-slate-50 px-2 py-1 rounded-sm">
                          {tag}
                        </span>
                      ))}
                    </div>
                    
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-900 uppercase tracking-widest border-b border-transparent group-hover:border-slate-900 pb-1 w-fit transition-all">
                      More <ArrowUpRight size={12} />
                    </div>
                  </div>
                </a>
              </div>
            ))}
          </Slider>
        </motion.div>
        
        <div className="mt-12 text-center md:hidden">
            <a 
            href="https://blog.naver.com/tmdrn0110" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-slate-900 font-bold hover:text-slate-600 transition-colors text-sm"
          >
            VIEW BLOG <ArrowUpRight size={16} />
          </a>
        </div>
      </div>
    </section>
  );
}
