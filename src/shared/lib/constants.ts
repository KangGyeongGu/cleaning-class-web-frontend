// 프로젝트 전역 상수 — 도메인 데이터 한 곳에서 관리

/**
 * 서비스 카테고리 목록 — 어드민 폼, 리뷰 필터 등에서 공통으로 사용
 * "기타 문의"는 필터 UI에 노출하지 않으므로 별도 배열로 분리
 */
export const SERVICE_TYPES = [
  "거주청소",
  "정기청소",
  "특수청소",
  "쓰레기집청소",
  "상가청소",
] as const;

export type ServiceType = (typeof SERVICE_TYPES)[number];

/**
 * 견적 문의 폼에서 선택 가능한 서비스 목록 — SERVICE_TYPES에 "기타 문의" 추가
 */
export const INQUIRY_SERVICE_OPTIONS: string[] = [
  ...SERVICE_TYPES,
  "기타 문의",
];
