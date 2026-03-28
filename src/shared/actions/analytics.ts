"use server";

import {
  getAnalyticsData,
  getAnalyticsSummary,
  getAnalyticsDailyVisitors,
  getAnalyticsTrafficSources,
  getAnalyticsDevice,
  getAnalyticsTopPages,
  getAnalyticsRegion,
} from "@/shared/lib/queries/analytics";
import type { AnalyticsData } from "@/shared/lib/queries/analytics";
import { getUser } from "@/shared/lib/supabase/auth";

/** 인증 실패·API 오류 시 null 반환하는 안전한 실행 래퍼 */
async function safeAction<T>(fn: () => Promise<T>): Promise<T | null> {
  try {
    await getUser();
    return await fn();
  } catch (error) {
    console.error(
      "[analytics action]",
      error instanceof Error ? error.message : error,
    );
    return null;
  }
}

/** 인증 확인 후 전체 GA4 데이터 조회 */
export async function refreshAllAnalytics(): Promise<AnalyticsData | null> {
  return safeAction(getAnalyticsData);
}

/** 인증 확인 후 KPI 요약 + 전환 이벤트 조회 */
export async function refreshSummary(): Promise<Pick<
  AnalyticsData,
  "summary" | "conversionEvents" | "lastUpdated"
> | null> {
  return safeAction(getAnalyticsSummary);
}

/** 인증 확인 후 일별 방문자 조회 */
export async function refreshDailyVisitors(): Promise<AnalyticsData["dailyVisitors"] | null> {
  return safeAction(getAnalyticsDailyVisitors);
}

/** 인증 확인 후 유입 경로 조회 */
export async function refreshTrafficSources(): Promise<AnalyticsData["trafficSources"] | null> {
  return safeAction(getAnalyticsTrafficSources);
}

/** 인증 확인 후 디바이스 + 브라우저 조회 */
export async function refreshDevice(): Promise<Pick<
  AnalyticsData,
  "deviceBreakdown" | "deviceDetail" | "browserBreakdown"
> | null> {
  return safeAction(getAnalyticsDevice);
}

/** 인증 확인 후 인기 페이지 조회 */
export async function refreshTopPages(): Promise<AnalyticsData["topPages"] | null> {
  return safeAction(getAnalyticsTopPages);
}

/** 인증 확인 후 지역별 방문자 조회 */
export async function refreshRegion(): Promise<AnalyticsData["regionBreakdown"] | null> {
  return safeAction(getAnalyticsRegion);
}
