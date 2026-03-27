// 작업 방식 섹션 — 4단계 프로세스를 타임라인 형식으로 표현
// 번호(01~04) 타이포그래피를 주 시각 요소로 사용, 이모지/아이콘 사용하지 않음
// 스크롤 진입 시 IntersectionObserver로 순차 페이드인 적용

"use client";

import { useEffect, useRef, useState } from "react";

// 작업 4단계 정적 데이터 — 섹션 컴포넌트 파일에 로컬 보관
const PROCESS_STEPS = [
  {
    number: "01",
    title: "견적 문의",
    description: "전화, 카카오, 네이버 블로그 등 편한 방법으로 문의해 주시면 빠르게 답변드립니다.",
    note: null,
  },
  {
    number: "02",
    title: "방문 견적",
    description: "직접 현장을 확인한 후 정확한 견적을 산출합니다. 거리나 규모에 따라 생략 가능합니다.",
    note: "(필요시)",
  },
  {
    number: "03",
    title: "예약 확정",
    description: "일정과 금액을 확정하고 예약을 완료합니다. 계약서나 카카오 채팅으로 내용을 공유드립니다.",
    note: null,
  },
  {
    number: "04",
    title: "작업 진행",
    description: "전문 장비와 검증된 세제를 사용해 꼼꼼하게 작업하고, 완료 후 결과물을 사진으로 남깁니다.",
    note: null,
  },
] as const;

interface StepCardProps {
  step: (typeof PROCESS_STEPS)[number];
  index: number;
  isVisible: boolean;
}

// 단계별 카드 — 번호·제목·설명 구조
function StepCard({ step, index, isVisible }: StepCardProps): React.ReactElement {
  // 스크롤 진입 시 순차 딜레이로 슬라이드업 효과
  const delay = index * 120;

  return (
    <div
      className="flex flex-col"
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? "translateY(0)" : "translateY(24px)",
        transition: `opacity 0.5s ease-out ${delay}ms, transform 0.5s ease-out ${delay}ms`,
      }}
    >
      {/* 단계 번호 — 대형 타이포그래피가 시각적 앵커 역할 */}
      <div className="mb-4 flex items-baseline gap-3">
        <span
          className="font-black leading-none text-slate-900 select-none"
          style={{ fontSize: "clamp(2.5rem, 5vw, 4rem)" }}
          aria-hidden="true"
        >
          {step.number}
        </span>
        {step.note && (
          <span className="text-xs font-medium text-slate-400 tracking-wide">
            {step.note}
          </span>
        )}
      </div>

      <h3 className="text-heading-3 mb-2">{step.title}</h3>
      <p className="text-body-sm leading-relaxed text-slate-600">
        {step.description}
      </p>
    </div>
  );
}

export function WorkProcessSection(): React.ReactElement {
  const sectionRef = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  // IntersectionObserver — 섹션이 뷰포트에 진입할 때 한 번만 트리거
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="process"
      className="bg-slate-50 py-16 md:py-32"
      aria-labelledby="process-heading"
    >
      <div className="container mx-auto max-w-7xl px-4 md:px-8 lg:px-12">
        {/* 섹션 헤더 */}
        <div
          className="mb-16 md:mb-20"
          style={{
            opacity: isVisible ? 1 : 0,
            transform: isVisible ? "translateY(0)" : "translateY(16px)",
            transition: "opacity 0.5s ease-out, transform 0.5s ease-out",
          }}
        >
          <h2
            id="process-heading"
            className="text-heading-1 mb-4"
          >
            진행 과정
          </h2>
          <p className="text-body-sm max-w-md tracking-wide text-slate-500 md:text-base">
            문의부터 작업 완료까지, 청소클라쓰의 일하는 방식을 미리 확인하세요.
          </p>
        </div>

        {/* 4단계 그리드 — 데스크탑: 4열, 태블릿: 2열, 모바일: 1열 */}
        {/* 데스크탑에서는 단계 번호 아래 얇은 구분선으로 연결 흐름 표현 */}
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-0">
          {PROCESS_STEPS.map((step, index) => (
            <div
              key={step.number}
              className={`flex flex-col lg:pr-8 ${
                index < PROCESS_STEPS.length - 1
                  ? "lg:border-r lg:border-slate-200"
                  : ""
              } ${index > 0 ? "lg:pl-8" : ""}`}
            >
              <StepCard step={step} index={index} isVisible={isVisible} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
