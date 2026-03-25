"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/shared/lib/supabase/server";
import { getUser } from "@/shared/lib/supabase/auth";
import { uploadImage, deleteImage } from "@/shared/lib/supabase/storage-server";
import { serviceFormSchema } from "@/shared/lib/schema";
import type { ServiceInsert, ServiceUpdate } from "@/shared/types/database";

const BUCKET = "service-images";

/**
 * 서비스 생성 Server Action
 */
export async function createService(prevState: unknown, formData: FormData) {
  try {
    await getUser();

    // tags FormData 직렬화 JSON 파싱 (빈 배열 fallback)
    let parsedTags: unknown;
    try {
      parsedTags = formData.get("tags")
        ? JSON.parse(formData.get("tags") as string)
        : [];
    } catch {
      parsedTags = [];
    }

    const rawData = {
      title: formData.get("title"),
      tags: parsedTags,
      sort_order: Number(formData.get("sort_order") || 0),
      is_published: formData.get("is_published") === "true",
      image_focal_x: Number(formData.get("image_focal_x") || 50),
      image_focal_y: Number(formData.get("image_focal_y") || 50),
      image_after_focal_x: Number(formData.get("image_after_focal_x") || 50),
      image_after_focal_y: Number(formData.get("image_after_focal_y") || 50),
    };

    const validationResult = serviceFormSchema.safeParse(rawData);
    if (!validationResult.success) {
      return {
        success: false,
        errors: validationResult.error.flatten().fieldErrors,
      };
    }

    const imageFile = formData.get("image") as File | null;
    if (!imageFile || imageFile.size === 0) {
      return { success: false, error: "Before 이미지를 선택해주세요." };
    }
    let imagePath = "";

    if (imageFile && imageFile.size > 0) {
      imagePath = await uploadImage(BUCKET, imageFile);
    }

    const imageAfterFile = formData.get("image_after") as File | null;
    let imageAfterPath = "";

    if (imageAfterFile && imageAfterFile.size > 0) {
      imageAfterPath = await uploadImage(BUCKET, imageAfterFile);
    }

    const supabase = await createClient();
    const serviceData: ServiceInsert = {
      ...validationResult.data,
      image_path: imagePath,
      image_after_path: imageAfterPath,
    };

    const { error } = await supabase.from("services").insert(serviceData);

    if (error) {
      console.error("createService DB error:", error);
      if (imagePath) {
        try {
          await deleteImage(BUCKET, imagePath);
        } catch (rollbackErr) {
          console.error(
            "createService: before-image rollback failed:",
            rollbackErr,
          );
        }
      }
      if (imageAfterPath) {
        try {
          await deleteImage(BUCKET, imageAfterPath);
        } catch (rollbackErr) {
          console.error(
            "createService: after-image rollback failed:",
            rollbackErr,
          );
        }
      }
      return { success: false, error: "서비스 등록 중 오류가 발생했습니다." };
    }

    revalidatePath("/");
    revalidatePath("/admin/services");

    return {
      success: true,
      message: "서비스가 등록되었습니다.",
    };
  } catch (error) {
    console.error("createService error:", error);
    return {
      success: false,
      error: "서비스 등록 중 오류가 발생했습니다.",
    };
  }
}

/**
 * 서비스 수정 Server Action
 */
export async function updateService(
  serviceId: string,
  prevState: unknown,
  formData: FormData,
) {
  try {
    await getUser();

    // tags FormData 직렬화 JSON 파싱 (빈 배열 fallback)
    let parsedTagsUpdate: unknown;
    try {
      parsedTagsUpdate = formData.get("tags")
        ? JSON.parse(formData.get("tags") as string)
        : [];
    } catch {
      parsedTagsUpdate = [];
    }

    const rawData = {
      title: formData.get("title"),
      tags: parsedTagsUpdate,
      sort_order: Number(formData.get("sort_order") || 0),
      is_published: formData.get("is_published") === "true",
      image_focal_x: Number(formData.get("image_focal_x") || 50),
      image_focal_y: Number(formData.get("image_focal_y") || 50),
      image_after_focal_x: Number(formData.get("image_after_focal_x") || 50),
      image_after_focal_y: Number(formData.get("image_after_focal_y") || 50),
    };

    const validationResult = serviceFormSchema.safeParse(rawData);
    if (!validationResult.success) {
      return {
        success: false,
        errors: validationResult.error.flatten().fieldErrors,
      };
    }

    const supabase = await createClient();

    const { data: existingService, error: fetchError } = await supabase
      .from("services")
      .select("image_path, image_after_path")
      .eq("id", serviceId)
      .single();

    if (fetchError || !existingService) {
      console.error("updateService fetch error:", fetchError);
      return { success: false, error: "서비스 수정 중 오류가 발생했습니다." };
    }

    const existing = existingService as {
      image_path: string;
      image_after_path: string;
    };

    const imageFile = formData.get("image") as File | null;
    let newImagePath = existing.image_path;

    if (imageFile && imageFile.size > 0) {
      newImagePath = await uploadImage(BUCKET, imageFile);
    }

    const imageAfterFile = formData.get("image_after") as File | null;
    let newImageAfterPath = existing.image_after_path;

    if (imageAfterFile && imageAfterFile.size > 0) {
      newImageAfterPath = await uploadImage(BUCKET, imageAfterFile);
    }

    const serviceData: ServiceUpdate = {
      ...validationResult.data,
      image_path: newImagePath,
      image_after_path: newImageAfterPath,
      updated_at: new Date().toISOString(),
    };

    const { error: updateError } = await supabase
      .from("services")
      .update(serviceData)
      .eq("id", serviceId);

    if (updateError) {
      console.error("updateService DB error:", updateError);
      if (newImagePath !== existing.image_path) {
        try {
          await deleteImage(BUCKET, newImagePath);
        } catch (rollbackErr) {
          console.error("updateService: image rollback failed:", rollbackErr);
        }
      }
      if (newImageAfterPath !== existing.image_after_path) {
        try {
          await deleteImage(BUCKET, newImageAfterPath);
        } catch (rollbackErr) {
          console.error(
            "updateService: after-image rollback failed:",
            rollbackErr,
          );
        }
      }
      return { success: false, error: "서비스 수정 중 오류가 발생했습니다." };
    }

    revalidatePath("/");
    revalidatePath("/admin/services");

    // DB 업데이트 성공 후 기존 이미지 삭제 (실패해도 성공 응답 유지)
    if (
      imageFile &&
      imageFile.size > 0 &&
      existing.image_path &&
      newImagePath !== existing.image_path
    ) {
      try {
        await deleteImage(BUCKET, existing.image_path);
      } catch (err) {
        console.error("updateService: old image cleanup failed:", err);
      }
    }
    if (
      imageAfterFile &&
      imageAfterFile.size > 0 &&
      existing.image_after_path &&
      newImageAfterPath !== existing.image_after_path
    ) {
      try {
        await deleteImage(BUCKET, existing.image_after_path);
      } catch (err) {
        console.error("updateService: old after-image cleanup failed:", err);
      }
    }

    return {
      success: true,
      message: "서비스가 수정되었습니다.",
    };
  } catch (error) {
    console.error("updateService error:", error);
    return {
      success: false,
      error: "서비스 수정 중 오류가 발생했습니다.",
    };
  }
}

/**
 * 서비스 삭제 Server Action
 */
export async function deleteService(serviceId: string) {
  try {
    await getUser();

    const supabase = await createClient();

    const { data: existingService, error: fetchError } = await supabase
      .from("services")
      .select("image_path, image_after_path")
      .eq("id", serviceId)
      .single();

    if (fetchError || !existingService) {
      console.error("deleteService fetch error:", fetchError);
      return { success: false, error: "서비스 삭제 중 오류가 발생했습니다." };
    }

    const existing = existingService as {
      image_path: string;
      image_after_path: string;
    };

    const { error: deleteError } = await supabase
      .from("services")
      .delete()
      .eq("id", serviceId);

    if (deleteError) {
      console.error("deleteService DB error:", deleteError);
      return { success: false, error: "서비스 삭제 중 오류가 발생했습니다." };
    }

    if (existing.image_path) {
      try {
        await deleteImage(BUCKET, existing.image_path);
      } catch (err) {
        console.error("deleteService: image cleanup failed:", err);
      }
    }
    if (existing.image_after_path) {
      try {
        await deleteImage(BUCKET, existing.image_after_path);
      } catch (err) {
        console.error("deleteService: after-image cleanup failed:", err);
      }
    }

    revalidatePath("/");
    revalidatePath("/admin/services");

    return {
      success: true,
      message: "서비스가 삭제되었습니다.",
    };
  } catch (error) {
    console.error("deleteService error:", error);
    return {
      success: false,
      error: "서비스 삭제 중 오류가 발생했습니다.",
    };
  }
}

/**
 * 서비스 게시 상태 토글 Server Action
 */
export async function toggleServicePublish(
  serviceId: string,
  isPublished: boolean,
) {
  try {
    await getUser();

    const supabase = await createClient();
    const { error } = await supabase
      .from("services")
      .update({
        is_published: isPublished,
        updated_at: new Date().toISOString(),
      })
      .eq("id", serviceId);

    if (error) {
      console.error("toggleServicePublish DB error:", error);
      return {
        success: false,
        error: "게시 상태 변경 중 오류가 발생했습니다.",
      };
    }

    revalidatePath("/");
    revalidatePath("/admin/services");

    return {
      success: true,
      message: `서비스가 ${isPublished ? "게시" : "비공개"}되었습니다.`,
    };
  } catch (error) {
    console.error("toggleServicePublish error:", error);
    return {
      success: false,
      error: "게시 상태 변경 중 오류가 발생했습니다.",
    };
  }
}

/**
 * 서비스 순서 일괄 변경 Server Action
 */
export async function reorderServices(
  orderedIds: string[],
): Promise<{ success: boolean; error?: string }> {
  try {
    const user = await getUser();
    if (!user) {
      return { success: false, error: "인증이 필요합니다." };
    }

    const supabase = await createClient();

    for (let i = 0; i < orderedIds.length; i++) {
      const { error } = await supabase
        .from("services")
        .update({ sort_order: i })
        .eq("id", orderedIds[i]);

      if (error) {
        console.error("reorderServices DB error:", error);
        return { success: false, error: "순서 변경 중 오류가 발생했습니다." };
      }
    }

    revalidatePath("/");
    revalidatePath("/admin/services");

    return { success: true };
  } catch (error) {
    console.error("reorderServices error:", error);
    return { success: false, error: "순서 변경 중 오류가 발생했습니다." };
  }
}
