"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/shared/lib/supabase/server";
import { getUser } from "@/shared/lib/supabase/auth";
import { siteConfigFormSchema } from "@/shared/lib/schema";
import type { SiteConfigUpdate } from "@/shared/types/database";

/** site_config의 단일 필드를 수정하는 공통 내부 함수 */
const FIELD_REVALIDATE_MAP: Record<string, string> = {
  faq_description: "/admin/faq",
  review_description: "/admin/reviews",
  service_description: "/admin/services",
};

async function updateSiteConfigField(
  field: "faq_description" | "review_description" | "service_description",
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
      console.error("updateSiteConfigField fetch error", { field }, fetchError);
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
      console.error("updateSiteConfigField update error", { field }, error);
      return { success: false, error: "설정 처리 중 오류가 발생했습니다." };
    }

    revalidatePath("/");
    const adminPath = FIELD_REVALIDATE_MAP[field];
    if (adminPath) revalidatePath(adminPath);

    return { success: true };
  } catch (error) {
    console.error("updateSiteConfigField error", { field }, error);
    return {
      success: false,
      error: "설정 처리 중 오류가 발생했습니다.",
    };
  }
}

/**
 * FAQ 안내 문구 수정 Server Action
 */
export async function updateFaqDescription(description: string) {
  return updateSiteConfigField("faq_description", description);
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

    // 2. DB에서 현재 행 조회 (클라이언트 변조 불가 필드를 서버에서 직접 읽기)
    const supabase = await createClient();
    const { data: current, error: fetchConfigError } = await supabase
      .from("site_config")
      .select("id, site_url, address_region, address_locality")
      .limit(1)
      .single<{
        id: string;
        site_url: string;
        address_region: string;
        address_locality: string;
      }>();

    if (fetchConfigError) {
      console.error("updateSiteConfig fetch error:", fetchConfigError);
      throw new Error("설정 처리 중 오류가 발생했습니다.");
    }
    if (!current) {
      throw new Error("설정 처리 중 오류가 발생했습니다.");
    }

    // 3. FormData 파싱 (site_url, address_region, address_locality는 DB 값 사용)
    const rawData = {
      business_name: formData.get("business_name"),
      representative: formData.get("representative") || "",
      business_registration_number:
        formData.get("business_registration_number") || "",
      phone: formData.get("phone"),
      email: formData.get("email"),
      blog_url: formData.get("blog_url") || "",
      instagram_url: formData.get("instagram_url") || "",
      daangn_url: formData.get("daangn_url") || "",
      site_url: current.site_url,
      description: formData.get("description") || "",
      address_region: current.address_region,
      address_locality: current.address_locality,
      address: formData.get("address") || "",
    };

    // 4. Zod 검증
    const validationResult = siteConfigFormSchema.safeParse(rawData);
    if (!validationResult.success) {
      return {
        success: false,
        errors: validationResult.error.flatten().fieldErrors,
      };
    }

    // 5. DB UPDATE
    const configData: SiteConfigUpdate = {
      ...validationResult.data,
      blog_url: validationResult.data.blog_url || "",
      instagram_url: validationResult.data.instagram_url || "",
      daangn_url: validationResult.data.daangn_url || "",
      description: validationResult.data.description || "",
      address: validationResult.data.address || "",
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase
      .from("site_config")
      .update(configData)
      .eq("id", current.id);

    if (error) {
      console.error("updateSiteConfig update error:", error);
      throw new Error("설정 처리 중 오류가 발생했습니다.");
    }

    // 6. 캐시 무효화 (공개 페이지 즉시 반영)
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
