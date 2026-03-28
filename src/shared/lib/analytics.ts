/**
 * GA4 이벤트 트래킹 유틸리티
 * 서비스 전환율 측정을 위한 7종 이벤트 함수 모음
 * SSR 환경(서버 렌더링)에서 안전하게 동작하도록 window 가드 포함
 */

// ─── 이벤트 파라미터 타입 정의 ───────────────────────────────────────────────

/**
 * GA4 이벤트 파라미터의 기반 타입
 * gtag event 커맨드가 Record<string, unknown>을 요구하므로
 * 모든 이벤트 파라미터 타입은 이를 인터섹션으로 확장해야 함
 */
type BaseEventParams = Record<string, unknown>;

/** E1: 폼 제출 — generate_lead */
type GenerateLeadFormParams = BaseEventParams & {
  currency: "KRW";
  value: 0;
  lead_source: "quote_form";
  /** 서비스 유형 (예: "입주청소", "포장이사") */
  service_type: string;
  inquiry_type: "cleaning" | "moving";
};

/** E2: 전화 클릭 — generate_lead */
type GenerateLeadPhoneParams = BaseEventParams & {
  currency: "KRW";
  value: 0;
  lead_source: "phone_click";
  phone_type: "cleaning" | "moving";
  /** 클릭 발생 위치 */
  click_location: PhoneClickLocation;
};

/** 전화 클릭이 발생할 수 있는 위치 목록 */
type PhoneClickLocation =
  | "mobile_bottom"
  | "hero_cta"
  | "services_section"
  | "contact_form"
  | "contact_aside"
  | "footer";

/** E3: CTA 버튼 클릭 — select_content */
type SelectContentParams = BaseEventParams & {
  content_type: "cta_button";
  /** CTA 버튼 식별자 */
  content_id: CtaButtonId;
};

/** 사이트 내 CTA 버튼 식별자 */
type CtaButtonId =
  | "hero_quote_button"
  | "services_cleaning_contact"
  | "services_moving_contact"
  | "services_page_quote"
  | "navbar_contact"
  | `service_card_${string}`;

/** E4: 리뷰 카드 클릭 — review_card_click */
type ReviewCardClickParams = BaseEventParams & {
  review_id: string;
  review_title: string;
  /** 리뷰가 속한 서비스 유형 */
  service_type: string;
  click_source: "home_carousel" | "reviews_page";
  destination_url: string;
};

/** E5: SNS 링크 클릭 — sns_click */
type SnsClickParams = BaseEventParams & {
  sns_platform: "naver_blog" | "instagram" | "daangn";
  click_location: "navbar" | "footer" | "reviews_section" | "contact_aside";
};

/** E6: FAQ 항목 열기 — faq_open */
type FaqOpenParams = BaseEventParams & {
  faq_id: string;
  faq_question: string;
};

/** E7: 리뷰 필터 변경 — review_filter */
type ReviewFilterParams = BaseEventParams & {
  filter_category: string;
  filter_source: "home" | "reviews_page";
};

// ─── 내부 헬퍼 ───────────────────────────────────────────────────────────────

/**
 * 이벤트 전송 가능 여부 확인
 * SSR 환경 및 gtag 스크립트 미로드 상황 모두 방어
 */
function canTrack(): boolean {
  return (
    typeof window !== "undefined" && typeof window.gtag === "function"
  );
}

// ─── 공개 트래킹 함수 ─────────────────────────────────────────────────────────

/**
 * E1: 견적 신청 폼 제출 시 리드 전환 이벤트 전송
 * 서비스 유형별 전환율 측정에 활용
 */
export function trackGenerateLead(params: GenerateLeadFormParams): void {
  if (!canTrack()) return;
  window.gtag!("event", "generate_lead", params);
}

/**
 * E2: 전화번호 클릭 시 리드 전환 이벤트 전송
 * 클릭 위치별 전화 전환 경로 분석에 활용
 */
export function trackPhoneClick(params: GenerateLeadPhoneParams): void {
  if (!canTrack()) return;
  window.gtag!("event", "generate_lead", params);
}

/**
 * E3: CTA 버튼 클릭 이벤트 전송
 * 버튼별 인터랙션 빈도 측정에 활용
 */
export function trackSelectContent(params: SelectContentParams): void {
  if (!canTrack()) return;
  window.gtag!("event", "select_content", params);
}

/**
 * E4: 리뷰 카드 클릭 이벤트 전송
 * 리뷰 콘텐츠 참여율 및 상세 페이지 유입 경로 분석에 활용
 */
export function trackReviewCardClick(params: ReviewCardClickParams): void {
  if (!canTrack()) return;
  window.gtag!("event", "review_card_click", params);
}

/**
 * E5: SNS 외부 링크 클릭 이벤트 전송
 * 플랫폼·위치별 SNS 유입 경로 파악에 활용
 */
export function trackSnsClick(params: SnsClickParams): void {
  if (!canTrack()) return;
  window.gtag!("event", "sns_click", params);
}

/**
 * E6: FAQ 항목 열기 이벤트 전송
 * 고객이 자주 확인하는 질문 항목 파악에 활용
 */
export function trackFaqOpen(params: FaqOpenParams): void {
  if (!canTrack()) return;
  window.gtag!("event", "faq_open", params);
}

/**
 * E7: 리뷰 필터 변경 이벤트 전송
 * 카테고리별 리뷰 탐색 패턴 분석에 활용
 */
export function trackReviewFilter(params: ReviewFilterParams): void {
  if (!canTrack()) return;
  window.gtag!("event", "review_filter", params);
}

// 타입 재내보내기 — 호출 측에서 파라미터 타입을 명시적으로 사용할 수 있도록
export type {
  GenerateLeadFormParams,
  GenerateLeadPhoneParams,
  PhoneClickLocation,
  SelectContentParams,
  CtaButtonId,
  ReviewCardClickParams,
  SnsClickParams,
  FaqOpenParams,
  ReviewFilterParams,
};
