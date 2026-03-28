// GA4 Data API 쿼리 함수 — 서버 전용, 캐시 없음 (진입 시 항상 최신 조회)
import "server-only";

import { BetaAnalyticsDataClient } from "@google-analytics/data";

/** GA4 분석 데이터 타입 정의 */
export interface AnalyticsData {
  summary: {
    activeUsers: number;
    sessions: number;
    phoneClicks: number;
    formSubmissions: number;
  };
  dailyVisitors: Array<{ date: string; activeUsers: number; sessions: number }>;
  deviceBreakdown: Array<{ device: string; users: number }>;
  /** 디바이스별 세션·이탈률·체류시간 상세 */
  deviceDetail: Array<{
    device: string;
    sessions: number;
    bounceRate: number;
    avgSessionDuration: number;
  }>;
  /** 브라우저별 사용자 분포 */
  browserBreakdown: Array<{ browser: string; users: number }>;
  trafficSources: Array<{ channel: string; sessions: number }>;
  topPages: Array<{ path: string; views: number }>;
  conversionEvents: Array<{ eventName: string; count: number }>;
  /** 지역별(시/도 + 도시) 방문자 분포 */
  regionBreakdown: Array<{ region: string; city: string; users: number }>;
  /** 마지막 갱신 시각 (ISO 문자열) */
  lastUpdated: string;
}

/** 환경변수가 모두 설정된 경우에만 클라이언트를 생성, 그렇지 않으면 null 반환 */
function getGA4Client(): BetaAnalyticsDataClient | null {
  const email = process.env.GA_CLIENT_EMAIL;
  const privateKey = process.env.GA_PRIVATE_KEY;
  const propertyId = process.env.GA_PROPERTY_ID;

  if (!email || !privateKey || !propertyId) {
    return null;
  }

  return new BetaAnalyticsDataClient({
    credentials: {
      client_email: email,
      // 환경변수에서 \n 이스케이프를 실제 줄바꿈으로 변환
      private_key: privateKey.replace(/\\n/g, "\n"),
    },
  });
}

/** 날짜를 YYYY-MM-DD 형식으로 포맷 */
function formatDate(dateString: string): string {
  // GA4는 YYYYMMDD 형식으로 반환 — YYYY-MM-DD로 변환
  if (dateString.length === 8) {
    return `${dateString.slice(0, 4)}-${dateString.slice(4, 6)}-${dateString.slice(6, 8)}`;
  }
  return dateString;
}

/** 문자열을 정수로 안전하게 변환 */
function toNumber(value: string | null | undefined): number {
  const num = parseInt(value ?? "0", 10);
  return Number.isNaN(num) ? 0 : num;
}

/** 문자열을 소수로 안전하게 변환 */
function toFloat(value: string | null | undefined): number {
  const num = parseFloat(value ?? "0");
  return Number.isNaN(num) ? 0 : num;
}

/** GA4 공통 설정을 반환. 환경변수 미설정 시 null */
function getGA4Config(): { client: BetaAnalyticsDataClient; property: string; dateRange: { startDate: string; endDate: string } } | null {
  const client = getGA4Client();
  const propertyId = process.env.GA_PROPERTY_ID;
  if (!client || !propertyId) return null;
  return { client, property: `properties/${propertyId}`, dateRange: { startDate: "30daysAgo", endDate: "today" } };
}

/** 전체 GA4 분석 데이터를 조회한다. 캐시 없이 매번 최신 데이터를 가져온다. */
export async function getAnalyticsData(): Promise<AnalyticsData | null> {
  const config = getGA4Config();
  if (!config) {
    console.warn("[getAnalyticsData] GA4 클라이언트 생성 실패 — 환경변수 확인 필요");
    return null;
  }

  const { client, property, dateRange } = config;

  try {
    // 9종 쿼리를 병렬로 실행
    const [
      summaryResult,
      dailyResult,
      deviceResult,
      deviceDetailResult,
      browserResult,
      sourceResult,
      pagesResult,
      conversionResult,
      regionResult,
    ] = await Promise.all([
      // 1. 요약: 활성 사용자 수 + 세션 수 (차원 없음)
      client.runReport({
        property,
        dateRanges: [dateRange],
        metrics: [{ name: "activeUsers" }, { name: "sessions" }],
      }),

      // 2. 일별 방문자: date 차원 + activeUsers, sessions 지표
      client.runReport({
        property,
        dateRanges: [dateRange],
        dimensions: [{ name: "date" }],
        metrics: [{ name: "activeUsers" }, { name: "sessions" }],
        orderBys: [{ dimension: { dimensionName: "date" }, desc: false }],
      }),

      // 3. 디바이스 분류: deviceCategory 차원 + activeUsers 지표
      client.runReport({
        property,
        dateRanges: [dateRange],
        dimensions: [{ name: "deviceCategory" }],
        metrics: [{ name: "activeUsers" }],
      }),

      // 3-b. 디바이스별 상세: 세션 수, 이탈률, 평균 체류 시간
      client.runReport({
        property,
        dateRanges: [dateRange],
        dimensions: [{ name: "deviceCategory" }],
        metrics: [
          { name: "sessions" },
          { name: "bounceRate" },
          { name: "averageSessionDuration" },
        ],
      }),

      // 3-c. 브라우저별 사용자 분포 (상위 8개)
      client.runReport({
        property,
        dateRanges: [dateRange],
        dimensions: [{ name: "browser" }],
        metrics: [{ name: "activeUsers" }],
        orderBys: [{ metric: { metricName: "activeUsers" }, desc: true }],
        limit: 8,
      }),

      // 4. 유입 경로: sessionDefaultChannelGroup 차원 + sessions 지표
      client.runReport({
        property,
        dateRanges: [dateRange],
        dimensions: [{ name: "sessionDefaultChannelGroup" }],
        metrics: [{ name: "sessions" }],
        orderBys: [{ metric: { metricName: "sessions" }, desc: true }],
      }),

      // 5. 인기 페이지: pagePath 차원 + screenPageViews 지표, 상위 10개
      client.runReport({
        property,
        dateRanges: [dateRange],
        dimensions: [{ name: "pagePath" }],
        metrics: [{ name: "screenPageViews" }],
        orderBys: [
          { metric: { metricName: "screenPageViews" }, desc: true },
        ],
        limit: 10,
      }),

      // 6. 전환 이벤트: 주요 이벤트명 필터 + eventCount 지표
      client.runReport({
        property,
        dateRanges: [dateRange],
        dimensions: [{ name: "eventName" }],
        metrics: [{ name: "eventCount" }],
        dimensionFilter: {
          filter: {
            fieldName: "eventName",
            inListFilter: {
              values: [
                "generate_lead",
                "review_card_click",
                "sns_click",
                "faq_open",
                "phone_click",
              ],
            },
          },
        },
        orderBys: [{ metric: { metricName: "eventCount" }, desc: true }],
      }),

      // 9. 지역별 방문자: 국내(KR)만 필터, region + city 차원, 상위 15개
      client.runReport({
        property,
        dateRanges: [dateRange],
        dimensions: [{ name: "region" }, { name: "city" }],
        metrics: [{ name: "activeUsers" }],
        dimensionFilter: {
          filter: {
            fieldName: "countryId",
            stringFilter: { value: "KR" },
          },
        },
        orderBys: [{ metric: { metricName: "activeUsers" }, desc: true }],
        limit: 15,
      }),
    ]);

    // 요약 데이터 파싱
    const summaryRow = summaryResult[0]?.rows?.[0];
    const activeUsers = toNumber(summaryRow?.metricValues?.[0]?.value);
    const sessions = toNumber(summaryRow?.metricValues?.[1]?.value);

    // 전환 이벤트에서 전화 클릭 수와 폼 제출 수 추출
    const conversionRows = conversionResult[0]?.rows ?? [];
    const conversionEvents = conversionRows.map((row) => ({
      eventName: row.dimensionValues?.[0]?.value ?? "",
      count: toNumber(row.metricValues?.[0]?.value),
    }));

    const phoneClicks =
      conversionEvents.find((e) => e.eventName === "phone_click")?.count ?? 0;
    const formSubmissions =
      conversionEvents.find((e) => e.eventName === "generate_lead")?.count ??
      0;

    // 일별 방문자 데이터 파싱
    const dailyVisitors = (dailyResult[0]?.rows ?? []).map((row) => ({
      date: formatDate(row.dimensionValues?.[0]?.value ?? ""),
      activeUsers: toNumber(row.metricValues?.[0]?.value),
      sessions: toNumber(row.metricValues?.[1]?.value),
    }));

    // 디바이스 분류 데이터 파싱
    const deviceBreakdown = (deviceResult[0]?.rows ?? []).map((row) => ({
      device: row.dimensionValues?.[0]?.value ?? "",
      users: toNumber(row.metricValues?.[0]?.value),
    }));

    // 디바이스별 상세 지표 파싱 (세션, 이탈률, 평균 체류 시간)
    const deviceDetail = (deviceDetailResult[0]?.rows ?? []).map((row) => ({
      device: row.dimensionValues?.[0]?.value ?? "",
      sessions: toNumber(row.metricValues?.[0]?.value),
      bounceRate: toFloat(row.metricValues?.[1]?.value),
      avgSessionDuration: toFloat(row.metricValues?.[2]?.value),
    }));

    // 브라우저별 사용자 분포 파싱
    const browserBreakdown = (browserResult[0]?.rows ?? []).map((row) => ({
      browser: row.dimensionValues?.[0]?.value ?? "",
      users: toNumber(row.metricValues?.[0]?.value),
    }));

    // 유입 경로 데이터 파싱
    const trafficSources = (sourceResult[0]?.rows ?? []).map((row) => ({
      channel: row.dimensionValues?.[0]?.value ?? "",
      sessions: toNumber(row.metricValues?.[0]?.value),
    }));

    // 인기 페이지 데이터 파싱
    const topPages = (pagesResult[0]?.rows ?? []).map((row) => ({
      path: row.dimensionValues?.[0]?.value ?? "",
      views: toNumber(row.metricValues?.[0]?.value),
    }));

    // 지역별 방문자 파싱
    const regionBreakdown = (regionResult[0]?.rows ?? []).map((row) => ({
      region: row.dimensionValues?.[0]?.value ?? "",
      city: row.dimensionValues?.[1]?.value ?? "",
      users: toNumber(row.metricValues?.[0]?.value),
    }));

    return {
      summary: { activeUsers, sessions, phoneClicks, formSubmissions },
      dailyVisitors,
      deviceDetail,
      browserBreakdown,
      deviceBreakdown,
      trafficSources,
      topPages,
      conversionEvents,
      regionBreakdown,
      lastUpdated: new Date().toISOString(),
    };
  } catch (error) {
    // GA4 API 호출 실패 시 graceful degradation — null 반환
    const errMsg = error instanceof Error ? error.message : String(error);
    console.error("[getAnalyticsData] GA4 Data API 호출 실패:", errMsg);
    if (error instanceof Error && error.stack) {
      console.error("[getAnalyticsData] Stack:", error.stack);
    }
    return null;
  }
}

// ─── 개별 지표 조회 함수 (섹션별 새로고침용) ──────────────────────────────

/** KPI 요약 + 전환 이벤트 조회 */
export async function getAnalyticsSummary(): Promise<Pick<AnalyticsData, "summary" | "conversionEvents" | "lastUpdated"> | null> {
  const config = getGA4Config();
  if (!config) return null;
  const { client, property, dateRange } = config;

  try {
    const [summaryResult, conversionResult] = await Promise.all([
      client.runReport({ property, dateRanges: [dateRange], metrics: [{ name: "activeUsers" }, { name: "sessions" }] }),
      client.runReport({
        property, dateRanges: [dateRange], dimensions: [{ name: "eventName" }], metrics: [{ name: "eventCount" }],
        dimensionFilter: { filter: { fieldName: "eventName", inListFilter: { values: ["generate_lead", "review_card_click", "sns_click", "faq_open", "phone_click"] } } },
        orderBys: [{ metric: { metricName: "eventCount" }, desc: true }],
      }),
    ]);

    const summaryRow = summaryResult[0]?.rows?.[0];
    const conversionEvents = (conversionResult[0]?.rows ?? []).map((row) => ({
      eventName: row.dimensionValues?.[0]?.value ?? "", count: toNumber(row.metricValues?.[0]?.value),
    }));

    return {
      summary: {
        activeUsers: toNumber(summaryRow?.metricValues?.[0]?.value),
        sessions: toNumber(summaryRow?.metricValues?.[1]?.value),
        phoneClicks: conversionEvents.find((e) => e.eventName === "phone_click")?.count ?? 0,
        formSubmissions: conversionEvents.find((e) => e.eventName === "generate_lead")?.count ?? 0,
      },
      conversionEvents,
      lastUpdated: new Date().toISOString(),
    };
  } catch (error) {
    console.error("[getAnalyticsSummary]", error instanceof Error ? error.message : error);
    return null;
  }
}

/** 일별 방문자 추이 조회 */
export async function getAnalyticsDailyVisitors(): Promise<AnalyticsData["dailyVisitors"] | null> {
  const config = getGA4Config();
  if (!config) return null;
  const { client, property, dateRange } = config;

  try {
    const [result] = await client.runReport({
      property, dateRanges: [dateRange], dimensions: [{ name: "date" }],
      metrics: [{ name: "activeUsers" }, { name: "sessions" }],
      orderBys: [{ dimension: { dimensionName: "date" }, desc: false }],
    });
    return (result?.rows ?? []).map((row) => ({
      date: formatDate(row.dimensionValues?.[0]?.value ?? ""),
      activeUsers: toNumber(row.metricValues?.[0]?.value),
      sessions: toNumber(row.metricValues?.[1]?.value),
    }));
  } catch (error) {
    console.error("[getAnalyticsDailyVisitors]", error instanceof Error ? error.message : error);
    return null;
  }
}

/** 유입 경로 조회 */
export async function getAnalyticsTrafficSources(): Promise<AnalyticsData["trafficSources"] | null> {
  const config = getGA4Config();
  if (!config) return null;
  const { client, property, dateRange } = config;

  try {
    const [result] = await client.runReport({
      property, dateRanges: [dateRange], dimensions: [{ name: "sessionDefaultChannelGroup" }],
      metrics: [{ name: "sessions" }], orderBys: [{ metric: { metricName: "sessions" }, desc: true }],
    });
    return (result?.rows ?? []).map((row) => ({ channel: row.dimensionValues?.[0]?.value ?? "", sessions: toNumber(row.metricValues?.[0]?.value) }));
  } catch (error) {
    console.error("[getAnalyticsTrafficSources]", error instanceof Error ? error.message : error);
    return null;
  }
}

/** 디바이스 분류 + 상세 + 브라우저 조회 */
export async function getAnalyticsDevice(): Promise<Pick<AnalyticsData, "deviceBreakdown" | "deviceDetail" | "browserBreakdown"> | null> {
  const config = getGA4Config();
  if (!config) return null;
  const { client, property, dateRange } = config;

  try {
    const [deviceResult, detailResult, browserResult] = await Promise.all([
      client.runReport({ property, dateRanges: [dateRange], dimensions: [{ name: "deviceCategory" }], metrics: [{ name: "activeUsers" }] }),
      client.runReport({ property, dateRanges: [dateRange], dimensions: [{ name: "deviceCategory" }], metrics: [{ name: "sessions" }, { name: "bounceRate" }, { name: "averageSessionDuration" }] }),
      client.runReport({ property, dateRanges: [dateRange], dimensions: [{ name: "browser" }], metrics: [{ name: "activeUsers" }], orderBys: [{ metric: { metricName: "activeUsers" }, desc: true }], limit: 8 }),
    ]);

    return {
      deviceBreakdown: (deviceResult[0]?.rows ?? []).map((row) => ({ device: row.dimensionValues?.[0]?.value ?? "", users: toNumber(row.metricValues?.[0]?.value) })),
      deviceDetail: (detailResult[0]?.rows ?? []).map((row) => ({ device: row.dimensionValues?.[0]?.value ?? "", sessions: toNumber(row.metricValues?.[0]?.value), bounceRate: parseFloat(row.metricValues?.[1]?.value ?? "0"), avgSessionDuration: parseFloat(row.metricValues?.[2]?.value ?? "0") })),
      browserBreakdown: (browserResult[0]?.rows ?? []).map((row) => ({ browser: row.dimensionValues?.[0]?.value ?? "", users: toNumber(row.metricValues?.[0]?.value) })),
    };
  } catch (error) {
    console.error("[getAnalyticsDevice]", error instanceof Error ? error.message : error);
    return null;
  }
}

/** 인기 페이지 조회 */
export async function getAnalyticsTopPages(): Promise<AnalyticsData["topPages"] | null> {
  const config = getGA4Config();
  if (!config) return null;
  const { client, property, dateRange } = config;

  try {
    const [result] = await client.runReport({
      property, dateRanges: [dateRange], dimensions: [{ name: "pagePath" }],
      metrics: [{ name: "screenPageViews" }], orderBys: [{ metric: { metricName: "screenPageViews" }, desc: true }], limit: 10,
    });
    return (result?.rows ?? []).map((row) => ({ path: row.dimensionValues?.[0]?.value ?? "", views: toNumber(row.metricValues?.[0]?.value) }));
  } catch (error) {
    console.error("[getAnalyticsTopPages]", error instanceof Error ? error.message : error);
    return null;
  }
}

/** 지역별 방문자 조회 (국내만) */
export async function getAnalyticsRegion(): Promise<AnalyticsData["regionBreakdown"] | null> {
  const config = getGA4Config();
  if (!config) return null;
  const { client, property, dateRange } = config;

  try {
    const [result] = await client.runReport({
      property, dateRanges: [dateRange], dimensions: [{ name: "region" }, { name: "city" }],
      metrics: [{ name: "activeUsers" }],
      dimensionFilter: { filter: { fieldName: "countryId", stringFilter: { value: "KR" } } },
      orderBys: [{ metric: { metricName: "activeUsers" }, desc: true }], limit: 15,
    });
    return (result?.rows ?? []).map((row) => ({ region: row.dimensionValues?.[0]?.value ?? "", city: row.dimensionValues?.[1]?.value ?? "", users: toNumber(row.metricValues?.[0]?.value) }));
  } catch (error) {
    console.error("[getAnalyticsRegion]", error instanceof Error ? error.message : error);
    return null;
  }
}
