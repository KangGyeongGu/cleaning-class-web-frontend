"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/shared/lib/supabase/server";
import { siteConfigFormSchema } from "@/shared/lib/schema";
import type { SiteConfigUpdate } from "@/shared/types/database";

/**
 * 현재 인증된 사용자 확인
 */
async function getUser() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    throw new Error("인증이 필요합니다.");
  }

  return user;
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
      address_region: formData.get("address_region"),
      address_locality: formData.get("address_locality"),
    };

    // 3. Zod 검증
    const validationResult = siteConfigFormSchema.safeParse(rawData);
    if (!validationResult.success) {
      return {
        success: false,
        errors: validationResult.error.flatten().fieldErrors,
      };
    }

    // 4. DB UPDATE (id=1 고정, site_config는 단일 행)
    const supabase = await createClient();
    const configData: SiteConfigUpdate = {
      ...validationResult.data,
      blog_url: validationResult.data.blog_url || null,
      instagram_url: validationResult.data.instagram_url || null,
      description: validationResult.data.description || null,
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase
      .from("site_config")
      .update(configData as never)
      .eq("id", 1);

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
