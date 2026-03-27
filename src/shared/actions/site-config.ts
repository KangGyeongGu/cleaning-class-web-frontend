"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/shared/lib/supabase/server";
import { getUser } from "@/shared/lib/supabase/auth";
import { siteConfigFormSchema, movingSiteConfigSchema } from "@/shared/lib/schema";
import type { SiteConfigUpdate } from "@/shared/types/database";
import {
  uploadImage,
  deleteImage,
} from "@/shared/lib/supabase/storage-server";

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

export async function updateFaqDescription(description: string) {
  return updateSiteConfigField("faq_description", description);
}

export async function updateReviewDescription(description: string) {
  return updateSiteConfigField("review_description", description);
}

export async function updateServiceDescription(description: string) {
  return updateSiteConfigField("service_description", description);
}

export async function updateSiteConfig(prevState: unknown, formData: FormData) {
  try {
    await getUser();

    // site_url, address_region, address_locality는 클라이언트 변조 방지를 위해 DB에서 직접 읽음
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

    const validationResult = siteConfigFormSchema.safeParse(rawData);
    if (!validationResult.success) {
      return {
        success: false,
        errors: validationResult.error.flatten().fieldErrors,
      };
    }

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

/**
 * 히어로 이미지 업로드/교체/삭제 액션 (좌/우 2장 + focal point 지원)
 * - slot: "1" (좌) 또는 "2" (우) — 어떤 슬롯을 업데이트할지 결정
 * - 새 파일이 있으면: 업로드 → DB 업데이트 → 기존 이미지 삭제 (upload-first 패턴)
 * - delete_hero_image=true이면: DB 초기화 → 기존 이미지 삭제
 * - focal point 값이 있으면 함께 저장
 */
export async function updateHeroImage(
  prevState: unknown,
  formData: FormData,
): Promise<{ success: boolean; error?: string; message?: string }> {
  try {
    await getUser();

    const supabase = await createClient();
    const slot = formData.get("slot") === "2" ? "2" : "1";

    // 슬롯별 DB 컬럼명 매핑
    const pathCol = slot === "1" ? "hero_image_path" : "hero_image_path_2";
    const focalXCol = slot === "1" ? "hero_image_focal_x" : "hero_image_focal_x_2";
    const focalYCol = slot === "1" ? "hero_image_focal_y" : "hero_image_focal_y_2";
    const slotLabel = slot === "1" ? "좌측" : "우측";

    const { data: current, error: fetchError } = await supabase
      .from("site_config")
      .select("id, hero_image_path, hero_image_path_2")
      .limit(1)
      .single<{ id: string; hero_image_path: string | null; hero_image_path_2: string | null }>();

    if (fetchError || !current) {
      console.error("updateHeroImage fetch error:", fetchError);
      return { success: false, error: "설정 처리 중 오류가 발생했습니다." };
    }

    const currentPath = slot === "1" ? current.hero_image_path : current.hero_image_path_2;
    const deleteFlag = formData.get("delete_hero_image");
    const heroImageFile = formData.get("hero_image");

    // focal point 파싱
    const focalX = Number(formData.get("focal_x")) || 50;
    const focalY = Number(formData.get("focal_y")) || 50;

    // 삭제 요청 처리
    if (deleteFlag === "true") {
      const { error: updateError } = await supabase
        .from("site_config")
        .update({
          [pathCol]: "",
          [focalXCol]: 50,
          [focalYCol]: 50,
          updated_at: new Date().toISOString(),
        })
        .eq("id", current.id);

      if (updateError) {
        console.error("updateHeroImage delete error:", updateError);
        return { success: false, error: "설정 처리 중 오류가 발생했습니다." };
      }

      if (currentPath) {
        await deleteImage("hero-images", currentPath);
      }

      revalidatePath("/");
      revalidatePath("/admin/config");
      return { success: true, message: `${slotLabel} 히어로 이미지가 삭제되었습니다.` };
    }

    // focal point만 업데이트 (파일 없이 저장)
    if (!(heroImageFile instanceof File) || heroImageFile.size === 0) {
      // 기존 이미지가 있으면 focal point만 업데이트
      if (currentPath) {
        const { error: updateError } = await supabase
          .from("site_config")
          .update({
            [focalXCol]: focalX,
            [focalYCol]: focalY,
            updated_at: new Date().toISOString(),
          })
          .eq("id", current.id);

        if (updateError) {
          console.error("updateHeroImage focal update error:", updateError);
          return { success: false, error: "설정 처리 중 오류가 발생했습니다." };
        }

        revalidatePath("/");
        revalidatePath("/admin/config");
        return { success: true, message: `${slotLabel} 표시 영역이 업데이트되었습니다.` };
      }
      return { success: false, error: "업로드할 이미지를 선택해주세요." };
    }

    // 새 파일 업로드 (upload-first 패턴)
    const newImagePath = await uploadImage("hero-images", heroImageFile);

    const { error: updateError } = await supabase
      .from("site_config")
      .update({
        [pathCol]: newImagePath,
        [focalXCol]: focalX,
        [focalYCol]: focalY,
        updated_at: new Date().toISOString(),
      })
      .eq("id", current.id);

    if (updateError) {
      console.error("updateHeroImage DB update error:", updateError);
      await deleteImage("hero-images", newImagePath);
      return { success: false, error: "설정 처리 중 오류가 발생했습니다." };
    }

    if (currentPath) {
      await deleteImage("hero-images", currentPath);
    }

    revalidatePath("/");
    revalidatePath("/admin/config");
    return { success: true, message: `${slotLabel} 히어로 이미지가 업데이트되었습니다.` };
  } catch (error) {
    console.error("updateHeroImage error:", error);
    return { success: false, error: "설정 처리 중 오류가 발생했습니다." };
  }
}

/**
 * 이사업체 정보 업데이트 액션
 * moving_representative, moving_phone, moving_business_registration_number, moving_address 컬럼 업데이트
 */
export async function updateMovingSiteConfig(
  prevState: unknown,
  formData: FormData,
): Promise<{
  success: boolean;
  error?: string;
  errors?: Record<string, string[]>;
  message?: string;
}> {
  try {
    await getUser();

    const rawData = {
      moving_representative: formData.get("moving_representative") ?? "",
      moving_phone: formData.get("moving_phone") ?? "",
      moving_business_registration_number:
        formData.get("moving_business_registration_number") ?? "",
      moving_address: formData.get("moving_address") ?? "",
    };

    const validationResult = movingSiteConfigSchema.safeParse(rawData);
    if (!validationResult.success) {
      return {
        success: false,
        errors: validationResult.error.flatten().fieldErrors,
      };
    }

    const supabase = await createClient();
    const { data: current, error: fetchError } = await supabase
      .from("site_config")
      .select("id")
      .limit(1)
      .single<{ id: string }>();

    if (fetchError || !current) {
      console.error("updateMovingSiteConfig fetch error:", fetchError);
      return { success: false, error: "설정 처리 중 오류가 발생했습니다." };
    }

    const { error: updateError } = await supabase
      .from("site_config")
      .update({
        ...validationResult.data,
        updated_at: new Date().toISOString(),
      })
      .eq("id", current.id);

    if (updateError) {
      console.error("updateMovingSiteConfig update error:", updateError);
      return { success: false, error: "설정 처리 중 오류가 발생했습니다." };
    }

    revalidatePath("/");
    revalidatePath("/admin/config");

    return { success: true, message: "이사업체 정보가 수정되었습니다." };
  } catch (error) {
    console.error("updateMovingSiteConfig error:", error);
    return { success: false, error: "설정 처리 중 오류가 발생했습니다." };
  }
}
