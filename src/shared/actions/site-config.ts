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
      console.error(`updateSiteConfigField(${field}) fetch error:`, fetchError);
      return {
        success: false,
        error: "설정 처리 중 오류가 발생했습니다.",
      };
    }
    if (!current) {
      return { success: false, error: "설정 처리 중 오류가 발생했습니다." };
    }

    const { error } = await supabase
      .from("site_config")
      .update({ [field]: value, updated_at: new Date().toISOString() })
      .eq("id", current.id);

    if (error) {
      console.error(`updateSiteConfigField(${field}) update error:`, error);
      return { success: false, error: "설정 처리 중 오류가 발생했습니다." };
    }

    revalidatePath("/");
    revalidatePath(FIELD_REVALIDATE_MAP[field]);

    return { success: true };
  } catch (error) {
    console.error(`updateSiteConfigField(${field}) error:`, error);
    return {
      success: false,
      error: "설정 처리 중 오류가 발생했습니다.",
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
      console.error("updateSiteConfig fetch error:", fetchConfigError);
      throw new Error("설정 처리 중 오류가 발생했습니다.");
    }
    if (!current) {
      throw new Error("설정 처리 중 오류가 발생했습니다.");
    }

    const { error } = await supabase
      .from("site_config")
      .update(configData)
      .eq("id", current.id);

    if (error) {
      console.error("updateSiteConfig update error:", error);
      throw new Error("설정 처리 중 오류가 발생했습니다.");
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
      error: "설정 처리 중 오류가 발생했습니다.",
    };
  }
}
