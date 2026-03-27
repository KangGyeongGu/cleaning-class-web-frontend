/** 청소 서비스 카테고리 목록 — 어드민 폼, 리뷰 필터, 견적문의 분기 등에서 사용 */
export const CLEANING_SERVICE_TYPES = [
  "거주청소",
  "정기청소",
  "특수청소",
  "쓰레기집청소",
  "상가청소",
] as const;

export type CleaningServiceType = (typeof CLEANING_SERVICE_TYPES)[number];

/** 이사 서비스 카테고리 목록 — 이사의뢰 견적문의에서 사용 */
export const MOVING_SERVICE_TYPES = [
  "원룸이사",
  "일반이사",
  "반포장이사",
  "포장이사",
  "부분이사",
] as const;

export type MovingServiceType = (typeof MOVING_SERVICE_TYPES)[number];

/** 전체 서비스 유형 — 청소 + 이사 합집합, 서비스 관리 폼 등에서 사용 */
export const SERVICE_TYPES = [
  ...CLEANING_SERVICE_TYPES,
  ...MOVING_SERVICE_TYPES,
] as const;

export type ServiceType = (typeof SERVICE_TYPES)[number];

/** 청소의뢰 견적문의 선택지 — CLEANING_SERVICE_TYPES + "기타 문의" */
export const CLEANING_INQUIRY_OPTIONS: string[] = [
  ...CLEANING_SERVICE_TYPES,
  "기타 문의",
];

/** 이사의뢰 견적문의 선택지 — MOVING_SERVICE_TYPES + "기타 문의" */
export const MOVING_INQUIRY_OPTIONS: string[] = [
  ...MOVING_SERVICE_TYPES,
  "기타 문의",
];

/**
 * 하위 호환성 유지 — 기존 코드에서 INQUIRY_SERVICE_OPTIONS를 참조하는 경우 대비
 * @deprecated CLEANING_INQUIRY_OPTIONS 또는 MOVING_INQUIRY_OPTIONS를 사용하세요
 */
export const INQUIRY_SERVICE_OPTIONS: string[] = [...CLEANING_INQUIRY_OPTIONS];
