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

/** 인증 확인 후 전체 GA4 데이터 조회 */
export async function refreshAllAnalytics(): Promise<AnalyticsData | null> {
  await getUser();
  return getAnalyticsData();
}

/** 인증 확인 후 KPI 요약 + 전환 이벤트 조회 */
export async function refreshSummary(): Promise<Pick<AnalyticsData, "summary" | "conversionEvents" | "lastUpdated"> | null> {
  await getUser();
  return getAnalyticsSummary();
}

/** 인증 확인 후 일별 방문자 조회 */
export async function refreshDailyVisitors(): Promise<AnalyticsData["dailyVisitors"] | null> {
  await getUser();
  return getAnalyticsDailyVisitors();
}

/** 인증 확인 후 유입 경로 조회 */
export async function refreshTrafficSources(): Promise<AnalyticsData["trafficSources"] | null> {
  await getUser();
  return getAnalyticsTrafficSources();
}

/** 인증 확인 후 디바이스 + 브라우저 조회 */
export async function refreshDevice(): Promise<Pick<AnalyticsData, "deviceBreakdown" | "deviceDetail" | "browserBreakdown"> | null> {
  await getUser();
  return getAnalyticsDevice();
}

/** 인증 확인 후 인기 페이지 조회 */
export async function refreshTopPages(): Promise<AnalyticsData["topPages"] | null> {
  await getUser();
  return getAnalyticsTopPages();
}

/** 인증 확인 후 지역별 방문자 조회 */
export async function refreshRegion(): Promise<AnalyticsData["regionBreakdown"] | null> {
  await getUser();
  return getAnalyticsRegion();
}
