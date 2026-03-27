"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/shared/lib/supabase/server";
import { createStaticClient } from "@/shared/lib/supabase/static";
import { getUser } from "@/shared/lib/supabase/auth";
import { customerReviewFormSchema } from "@/shared/lib/schema";
import type { ReviewTokenRow } from "@/shared/types/database";

/** 통일 에러 메시지 — 토큰 관련 모든 실패에 동일 문구 노출 */
const TOKEN_ERROR_MESSAGE = "유효하지 않거나 만료된 링크입니다";

/**
 * 고객 리뷰 토큰 생성 — 인증된 관리자만 호출 가능
 * 만료일은 현재로부터 30일
 */
export async function generateReviewToken(): Promise<{
  success: boolean;
  token?: string;
  error?: string;
}> {
  try {
    await getUser();

    const token = crypto.randomUUID();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    const supabase = await createClient();
    const { error } = await supabase.from("review_tokens").insert({
      token,
      expires_at: expiresAt.toISOString(),
    });

    if (error) {
      console.error("[generateReviewToken] DB error:", error);
      throw new Error("토큰 생성 중 오류가 발생했습니다.");
    }

    revalidatePath("/admin/customer-reviews");

    return { success: true, token };
  } catch (err) {
    console.error("[generateReviewToken] error:", err);
    return {
      success: false,
      error: "토큰 생성 중 오류가 발생했습니다.",
    };
  }
}

/** 토큰 목록 조회 — 인증된 관리자만 호출 가능, 생성일 내림차순 */
export async function listReviewTokens(): Promise<{
  success: boolean;
  tokens?: ReviewTokenRow[];
  error?: string;
}> {
  try {
    await getUser();

    const supabase = await createClient();
    const { data, error } = await supabase
      .from("review_tokens")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("[listReviewTokens] DB error:", error);
      throw new Error("토큰 목록 조회 중 오류가 발생했습니다.");
    }

    return { success: true, tokens: (data as ReviewTokenRow[] | null) ?? [] };
  } catch (err) {
    console.error("[listReviewTokens] error:", err);
    return {
      success: false,
      error: "토큰 목록 조회 중 오류가 발생했습니다.",
    };
  }
}

/**
 * 토큰 삭제 — 인증된 관리자만 호출 가능
 * 연결된 customer_review가 있는 경우 DB 제약으로 실패할 수 있음
 */
export async function deleteReviewToken(tokenId: string): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    await getUser();

    const supabase = await createClient();
    const { error } = await supabase
      .from("review_tokens")
      .delete()
      .eq("id", tokenId);

    if (error) {
      console.error("[deleteReviewToken] DB error:", error);
      throw new Error("토큰 삭제 중 오류가 발생했습니다.");
    }

    revalidatePath("/admin/customer-reviews");

    return { success: true };
  } catch (err) {
    console.error("[deleteReviewToken] error:", err);
    return {
      success: false,
      error: "토큰 삭제 중 오류가 발생했습니다.",
    };
  }
}

/**
 * 고객 리뷰 제출 — 인증 불필요, 토큰 유효성은 RPC에서 원자적 검증
 * submit_customer_review RPC: SECURITY DEFINER, FOR UPDATE 락으로 중복 방지
 * 토큰 유효성(is_used=false + 미만료) 실패 시 통일 에러 메시지 반환
 */
export async function submitCustomerReview(
  prevState: unknown,
  formData: FormData,
): Promise<{
  success: boolean;
  error?: string;
  errors?: Record<string, string[]>;
}> {
  try {
    const rawData = {
      token: formData.get("token"),
      rating: Number(formData.get("rating")),
      comment: formData.get("comment"),
    };

    const validationResult = customerReviewFormSchema.safeParse(rawData);
    if (!validationResult.success) {
      return {
        success: false,
        errors: validationResult.error.flatten().fieldErrors,
      };
    }

    const { token, rating, comment } = validationResult.data;

    const supabase = createStaticClient();
    const { error } = await supabase.rpc("submit_customer_review", {
      p_token: token,
      p_rating: rating,
      p_comment: comment,
    });

    if (error) {
      // RPC 내부 INVALID_TOKEN raise 및 모든 DB 에러를 통일 메시지로 처리하여 토큰 존재 여부를 노출하지 않음
      console.error("[submitCustomerReview] RPC error:", error.message);
      return {
        success: false,
        error: TOKEN_ERROR_MESSAGE,
      };
    }

    revalidatePath("/");
    revalidatePath("/admin/customer-reviews");

    return { success: true };
  } catch (err) {
    console.error("[submitCustomerReview] error:", err);
    return {
      success: false,
      error: TOKEN_ERROR_MESSAGE,
    };
  }
}
