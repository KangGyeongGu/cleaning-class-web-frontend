/**
 * GA4 gtag.js 전역 타입 선언
 * window.gtag 함수에 대한 타입 안전성 보장을 위해 함수 오버로드 패턴 사용
 * any 타입 사용 금지 — Record<string, unknown> 으로 제한
 */

/** gtag config 커맨드 파라미터 */
interface GtagConfigParams extends Record<string, unknown> {
  page_title?: string;
  page_location?: string;
  send_page_view?: boolean;
}

/** gtag set 커맨드 파라미터 */
type GtagSetParams = Record<string, unknown>;

/** gtag event 커맨드 파라미터 */
type GtagEventParams = Record<string, unknown>;

/** gtag 함수 시그니처 오버로드 */
interface Gtag {
  (command: "config", targetId: string, params?: GtagConfigParams): void;
  (command: "event", eventName: string, params?: GtagEventParams): void;
  (command: "js", date: Date): void;
  (command: "set", params: GtagSetParams): void;
  (command: "set", targetId: string, params: GtagSetParams): void;
}

declare global {
  interface Window {
    /** GA4 gtag.js 전역 함수 — 스크립트 로드 전에는 undefined일 수 있음 */
    gtag?: Gtag;
    /** gtag 내부 커맨드 큐 */
    dataLayer?: Record<string, unknown>[];
  }
}

export type { Gtag, GtagConfigParams, GtagSetParams, GtagEventParams };
