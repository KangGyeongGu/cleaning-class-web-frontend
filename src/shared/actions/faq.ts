"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/shared/lib/supabase/server";
import { getUser } from "@/shared/lib/supabase/auth";
import { z } from "zod";
import { faqFormSchema } from "@/shared/lib/schema";
import type { FaqInsert, FaqUpdate } from "@/shared/types/database";

/** UUID 형식 검증 스키마 */
const uuidSchema = z.string().uuid("올바른 ID 형식이 아닙니다.");

/** display_order FormData 파싱 — 빈 문자열을 NaN으로 처리하여 Zod 검증에 위임 */
function parseDisplayOrder(formData: FormData): number {
  const raw = formData.get("display_order");
  if (raw === null || raw === "") return NaN;
  return Number(raw);
}

/** reorderFaqs 최대 항목 수 */
const MAX_REORDER_ITEMS = 100;

/** revalidatePath 대상 경로 */
const REVALIDATE_PATHS = ["/help", "/admin/faq"] as const;

/** 캐시 무효화 헬퍼 */
function revalidateFaqPaths(): void {
  for (const path of REVALIDATE_PATHS) {
    revalidatePath(path);
  }
}

/**
 * FAQ 생성 Server Action
 * 인증 확인 → Zod 검증 → DB INSERT → 캐시 무효화 순으로 처리
 */
export async function createFaq(prevState: unknown, formData: FormData) {
  try {
    // 1. 인증 확인
    await getUser();

    // 2. FormData 파싱
    const rawData = {
      question: formData.get("question"),
      answer: formData.get("answer"),
      display_order: parseDisplayOrder(formData),
      is_active: formData.get("is_active") === "true",
    };

    // 3. Zod 검증
    const validationResult = faqFormSchema.safeParse(rawData);
    if (!validationResult.success) {
      return {
        success: false,
        errors: validationResult.error.flatten().fieldErrors,
      };
    }

    // 4. DB INSERT
    const supabase = await createClient();
    const insertData: FaqInsert = validationResult.data;

    const { error } = await supabase.from("faqs").insert(insertData);

    if (error) {
      console.error("createFaq DB error:", error);
      throw new Error("FAQ 처리 중 오류가 발생했습니다.");
    }

    // 5. 캐시 무효화
    revalidateFaqPaths();

    return {
      success: true,
      message: "FAQ가 등록되었습니다.",
    };
  } catch (error) {
    console.error("createFaq error:", error);
    return {
      success: false,
      error: "FAQ 처리 중 오류가 발생했습니다.",
    };
  }
}

/**
 * FAQ 수정 Server Action
 * 인증 확인 → Zod 검증 → DB UPDATE → 캐시 무효화 순으로 처리
 */
export async function updateFaq(
  faqId: string,
  prevState: unknown,
  formData: FormData,
) {
  try {
    // 1. 인증 확인
    await getUser();

    // 2. faqId UUID 검증
    const idResult = uuidSchema.safeParse(faqId);
    if (!idResult.success) {
      return { success: false, error: "올바른 FAQ ID가 아닙니다." };
    }

    // 3. FormData 파싱
    const rawData = {
      question: formData.get("question"),
      answer: formData.get("answer"),
      display_order: parseDisplayOrder(formData),
      is_active: formData.get("is_active") === "true",
    };

    // 4. Zod 검증
    const validationResult = faqFormSchema.safeParse(rawData);
    if (!validationResult.success) {
      return {
        success: false,
        errors: validationResult.error.flatten().fieldErrors,
      };
    }

    // 5. DB UPDATE
    const supabase = await createClient();
    const updateData: FaqUpdate = {
      ...validationResult.data,
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase
      .from("faqs")
      .update(updateData)
      .eq("id", faqId);

    if (error) {
      console.error("updateFaq DB error:", error);
      throw new Error("FAQ 처리 중 오류가 발생했습니다.");
    }

    // 5. 캐시 무효화
    revalidateFaqPaths();

    return {
      success: true,
      message: "FAQ가 수정되었습니다.",
    };
  } catch (error) {
    console.error("updateFaq error:", error);
    return {
      success: false,
      error: "FAQ 처리 중 오류가 발생했습니다.",
    };
  }
}

/**
 * FAQ 삭제 Server Action
 * 인증 확인 → DB DELETE → 캐시 무효화 순으로 처리
 */
export async function deleteFaq(
  faqId: string,
): Promise<{ success: boolean; error?: string; message?: string }> {
  try {
    // 1. 인증 확인
    await getUser();

    // 2. faqId UUID 검증
    const idResult = uuidSchema.safeParse(faqId);
    if (!idResult.success) {
      return { success: false, error: "올바른 FAQ ID가 아닙니다." };
    }

    // 3. DB DELETE
    const supabase = await createClient();
    const { error } = await supabase.from("faqs").delete().eq("id", faqId);

    if (error) {
      console.error("deleteFaq DB error:", error);
      throw new Error("FAQ 처리 중 오류가 발생했습니다.");
    }

    // 3. 캐시 무효화
    revalidateFaqPaths();

    return {
      success: true,
      message: "FAQ가 삭제되었습니다.",
    };
  } catch (error) {
    console.error("deleteFaq error:", error);
    return {
      success: false,
      error: "FAQ 처리 중 오류가 발생했습니다.",
    };
  }
}

/**
 * FAQ 활성 상태 토글 Server Action
 * 인증 확인 → DB UPDATE → 캐시 무효화 순으로 처리
 */
export async function toggleFaqActive(
  faqId: string,
  isActive: boolean,
): Promise<{ success: boolean; error?: string; message?: string }> {
  try {
    // 1. 인증 확인
    await getUser();

    // 2. 입력 검증
    const idResult = uuidSchema.safeParse(faqId);
    if (!idResult.success) {
      return { success: false, error: "올바른 FAQ ID가 아닙니다." };
    }
    const boolResult = z.boolean().safeParse(isActive);
    if (!boolResult.success) {
      return { success: false, error: "올바른 활성 상태 값이 아닙니다." };
    }

    // 3. DB UPDATE
    const supabase = await createClient();
    const { error } = await supabase
      .from("faqs")
      .update({
        is_active: boolResult.data,
        updated_at: new Date().toISOString(),
      })
      .eq("id", faqId);

    if (error) {
      console.error("toggleFaqActive DB error:", error);
      throw new Error("FAQ 처리 중 오류가 발생했습니다.");
    }

    // 3. 캐시 무효화
    revalidateFaqPaths();

    return {
      success: true,
      message: `FAQ가 ${isActive ? "활성화" : "비활성화"}되었습니다.`,
    };
  } catch (error) {
    console.error("toggleFaqActive error:", error);
    return {
      success: false,
      error: "FAQ 처리 중 오류가 발생했습니다.",
    };
  }
}

/** reorderFaqs 입력 항목 타입 */
export interface FaqOrderItem {
  id: string;
  display_order: number;
}

/**
 * FAQ 순서 일괄 변경 Server Action
 * 첫 실패 시 즉시 반환하여 불일치 범위를 최소화하기 위해 순차 실행
 * (upsert는 Insert의 필수 필드를 요구하므로 부분 업데이트에 부적합)
 */
export async function reorderFaqs(
  items: FaqOrderItem[],
): Promise<{ success: boolean; error?: string }> {
  try {
    // 1. 인증 확인
    await getUser();

    if (items.length === 0) {
      return { success: true };
    }

    // 2. 입력 검증 — 길이 제한 + UUID + display_order 검증
    if (items.length > MAX_REORDER_ITEMS) {
      return { success: false, error: "순서 변경 항목이 너무 많습니다." };
    }
    const orderSchema = z.number().int().min(0);
    for (const item of items) {
      if (!uuidSchema.safeParse(item.id).success) {
        return { success: false, error: "올바른 FAQ ID가 아닙니다." };
      }
      if (!orderSchema.safeParse(item.display_order).success) {
        return { success: false, error: "올바른 순서 값이 아닙니다." };
      }
    }

    // 3. 순차 UPDATE로 N개 순서 일괄 업데이트 — 첫 실패 시 즉시 반환하여 불일치 범위 최소화
    const supabase = await createClient();
    const now = new Date().toISOString();

    for (const item of items) {
      const { error } = await supabase
        .from("faqs")
        .update({ display_order: item.display_order, updated_at: now })
        .eq("id", item.id);
      if (error) {
        console.error("reorderFaqs DB error:", error);
        return { success: false, error: "순서 변경 중 오류가 발생했습니다." };
      }
    }

    // 3. 캐시 무효화
    revalidateFaqPaths();

    return { success: true };
  } catch (error) {
    console.error("reorderFaqs error:", error);
    return { success: false, error: "순서 변경 중 오류가 발생했습니다." };
  }
}
