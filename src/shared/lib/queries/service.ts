/**
 * 서비스 관련 Supabase 쿼리 헬퍼
 * app/* 레이어에서 직접 Supabase를 호출하지 않도록 추출된 서버 전용 함수 모음
 */

import { createClient } from "@/shared/lib/supabase/server";
import { getServiceImageUrl } from "@/shared/lib/supabase/storage";
import type { Service } from "@/shared/types/database";

/** 이미지 URL이 포함된 서비스 타입 */
export interface ServiceWithImageUrl extends Service {
  imageUrl: string;
  afterImageUrl?: string;
}

/**
 * 전체 서비스 목록 조회 (sort_order 오름차순)
 * 이미지 URL 변환 포함
 */
export async function getServices(): Promise<ServiceWithImageUrl[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("services")
    .select("*")
    .order("sort_order", { ascending: true });

  if (error) {
    console.error("[getServices] 서비스 목록 조회 실패:", error);
    return [];
  }

  return ((data as Service[]) ?? []).map((service) => ({
    ...service,
    imageUrl: getServiceImageUrl(service.image_path),
    afterImageUrl: service.image_after_path
      ? getServiceImageUrl(service.image_after_path)
      : undefined,
  }));
}

/**
 * 단일 서비스 조회 (이미지 URL 변환 포함)
 * 미존재 시 null 반환
 */
export async function getServiceById(
  id: string,
): Promise<ServiceWithImageUrl | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("services")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) {
    if (error) {
      console.error(`[getServiceById] 서비스 조회 실패 (id=${id}):`, error);
    }
    return null;
  }

  const service = data as Service;
  return {
    ...service,
    imageUrl: getServiceImageUrl(service.image_path),
    afterImageUrl: service.image_after_path
      ? getServiceImageUrl(service.image_after_path)
      : undefined,
  };
}

/**
 * 다음 sort_order 값 계산
 * 현재 최대값 + 1 반환, 레코드가 없으면 0 반환
 */
export async function getNextServiceSortOrder(): Promise<number> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("services")
    .select("sort_order")
    .order("sort_order", { ascending: false })
    .limit(1)
    .single();

  if (error) {
    // 레코드 없음(PGRST116) 은 정상 케이스
    if (error.code !== "PGRST116") {
      console.error("[getNextServiceSortOrder] sort_order 조회 실패:", error);
    }
    return 0;
  }

  return (data?.sort_order ?? -1) + 1;
}
