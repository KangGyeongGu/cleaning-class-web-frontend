/**
 * FAQ 관련 Supabase 쿼리 헬퍼
 * app/* 레이어에서 직접 Supabase를 호출하지 않도록 추출된 서버 전용 함수 모음
 */

import { createClient } from "@/shared/lib/supabase/server";
import type { FaqRow } from "@/shared/types/database";

/**
 * 활성 FAQ 목록 조회 (is_active = true, display_order 오름차순)
 * 공개 페이지(/help)에서 사용
 */
export async function getActiveFaqs(): Promise<FaqRow[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("faqs")
    .select("*")
    .eq("is_active", true)
    .order("display_order", { ascending: true });

  if (error) {
    console.error("[getActiveFaqs] 활성 FAQ 목록 조회 실패:", error);
    return [];
  }

  return (data as FaqRow[]) ?? [];
}

/**
 * 전체 FAQ 목록 조회 (display_order 오름차순)
 * 관리자 페이지(/admin/faq)에서 사용
 */
export async function getAllFaqs(): Promise<FaqRow[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("faqs")
    .select("*")
    .order("display_order", { ascending: true });

  if (error) {
    console.error("[getAllFaqs] FAQ 전체 목록 조회 실패:", error);
    return [];
  }

  return (data as FaqRow[]) ?? [];
}

/**
 * 단일 FAQ 조회
 * 미존재 시 null 반환
 */
export async function getFaqById(id: string): Promise<FaqRow | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("faqs")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) {
    if (error) {
      console.error(`[getFaqById] FAQ 조회 실패 (id=${id}):`, error);
    }
    return null;
  }

  return data as FaqRow;
}

/**
 * 다음 display_order 값 계산
 * 현재 최대값 + 1 반환, 레코드가 없으면 0 반환
 */
export async function getNextFaqDisplayOrder(): Promise<number> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("faqs")
    .select("display_order")
    .order("display_order", { ascending: false })
    .limit(1)
    .single();

  if (error) {
    // 레코드 없음(PGRST116)은 정상 케이스
    if (error.code !== "PGRST116") {
      console.error("[getNextFaqDisplayOrder] display_order 조회 실패:", error);
    }
    return 0;
  }

  return (data?.display_order ?? -1) + 1;
}
