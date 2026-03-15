"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/shared/lib/supabase/server";
import { getUser } from "@/shared/lib/supabase/auth";
import { siteConfigFormSchema } from "@/shared/lib/schema";
import type { SiteConfigUpdate } from "@/shared/types/database";

/** site_config의 단일 필드를 수정하는 공통 내부 함수 */
const FIELD_REVALIDATE_MAP: Record<string, string> = {
  review_description: "/admin/reviews",
  service_description: "/admin/services",
};

async function updateSiteConfigField(
  field: "review_description" | "service_description",
  value: string,
) {
  try {
    await getUser();

    const supabase = await createClient();
    const { data: current, error: fetchError } = await supabase
      .from("site_config")
      .select("id")
      .limit(1)
      .single<{ id: string }>();

    if (fetchError) {
      return {
        success: false,
        error: `업체 정보 조회 실패: ${fetchError.message}`,
      };
    }
    if (!current) {
      return { success: false, error: "업체 정보를 찾을 수 없습니다." };
    }

    const { error } = await supabase
      .from("site_config")
      .update({ [field]: value, updated_at: new Date().toISOString() })
      .eq("id", current.id);

    if (error) {
      return { success: false, error: `수정 실패: ${error.message}` };
    }

    revalidatePath("/");
    revalidatePath(FIELD_REVALIDATE_MAP[field]);

    return { success: true };
  } catch (error) {
    console.error(`updateSiteConfigField(${field}) error:`, error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "수정 중 오류가 발생했습니다.",
    };
  }
}

/**
 * 리뷰 안내 문구 수정 Server Action
 */
export async function updateReviewDescription(description: string) {
  return updateSiteConfigField("review_description", description);
}

/**
 * 서비스 안내 문구 수정 Server Action
 */
export async function updateServiceDescription(description: string) {
  return updateSiteConfigField("service_description", description);
}

/**
 * 업체 정보(site_config) 수정 Server Action
 */
export async function updateSiteConfig(prevState: unknown, formData: FormData) {
  try {
    // 1. 인증 확인
    await getUser();

    // 2. FormData 파싱
    const rawData = {
      business_name: formData.get("business_name"),
      phone: formData.get("phone"),
      email: formData.get("email"),
      blog_url: formData.get("blog_url") || "",
      instagram_url: formData.get("instagram_url") || "",
      site_url: formData.get("site_url"),
      description: formData.get("description") || "",
      address_region: formData.get("address_region") || "",
      address_locality: formData.get("address_locality") || "",
      address: formData.get("address") || "",
    };

    // 3. Zod 검증
    const validationResult = siteConfigFormSchema.safeParse(rawData);
    if (!validationResult.success) {
      return {
        success: false,
        errors: validationResult.error.flatten().fieldErrors,
      };
    }

    // 4. DB UPDATE (site_config는 단일 행, id 조회 후 업데이트)
    const supabase = await createClient();
    const configData: SiteConfigUpdate = {
      ...validationResult.data,
      blog_url: validationResult.data.blog_url || "",
      instagram_url: validationResult.data.instagram_url || "",
      description: validationResult.data.description || "",
      address: validationResult.data.address || "",
      updated_at: new Date().toISOString(),
    };

    const { data: current, error: fetchConfigError } = await supabase
      .from("site_config")
      .select("id")
      .limit(1)
      .single<{ id: string }>();

    if (fetchConfigError) {
      throw new Error(`업체 정보 조회 실패: ${fetchConfigError.message}`);
    }
    if (!current) {
      throw new Error("업체 정보를 찾을 수 없습니다.");
    }

    const { error } = await supabase
      .from("site_config")
      .update(configData)
      .eq("id", current.id);

    if (error) {
      throw new Error(`업체 정보 수정 실패: ${error.message}`);
    }

    // 5. 캐시 무효화 (공개 페이지 즉시 반영)
    revalidatePath("/");
    revalidatePath("/admin/config");

    return {
      success: true,
      message: "업체 정보가 수정되었습니다.",
    };
  } catch (error) {
    console.error("updateSiteConfig error:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "업체 정보 수정 중 오류가 발생했습니다.",
    };
  }
}
