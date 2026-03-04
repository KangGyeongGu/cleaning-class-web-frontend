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

    const rawData = {
      title: formData.get("title"),
      description: formData.get("description"),
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

    const { error } = await supabase
      .from("services")
      .insert(serviceData );

    if (error) {
      if (imagePath) await deleteImage(BUCKET, imagePath);
      if (imageAfterPath) await deleteImage(BUCKET, imageAfterPath);
      throw new Error(`서비스 등록 실패: ${error.message}`);
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
      error:
        error instanceof Error ? error.message : "서비스 등록 중 오류가 발생했습니다.",
    };
  }
}

/**
 * 서비스 수정 Server Action
 */
export async function updateService(
  serviceId: string,
  prevState: unknown,
  formData: FormData
) {
  try {
    await getUser();

    const rawData = {
      title: formData.get("title"),
      description: formData.get("description"),
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
      throw new Error(`서비스 조회 실패: ${fetchError?.message || "서비스를 찾을 수 없습니다"}`);
    }

    const existing = existingService as { image_path: string; image_after_path: string };

    const imageFile = formData.get("image") as File | null;
    let newImagePath = existing.image_path;

    if (imageFile && imageFile.size > 0) {
      if (existing.image_path) await deleteImage(BUCKET, existing.image_path);
      newImagePath = await uploadImage(BUCKET, imageFile);
    }

    const imageAfterFile = formData.get("image_after") as File | null;
    let newImageAfterPath = existing.image_after_path;

    if (imageAfterFile && imageAfterFile.size > 0) {
      if (existing.image_after_path) await deleteImage(BUCKET, existing.image_after_path);
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
      .update(serviceData )
      .eq("id", serviceId);

    if (updateError) {
      if (newImagePath !== existing.image_path) await deleteImage(BUCKET, newImagePath);
      if (newImageAfterPath !== existing.image_after_path) await deleteImage(BUCKET, newImageAfterPath);
      throw new Error(`서비스 수정 실패: ${updateError.message}`);
    }

    revalidatePath("/");
    revalidatePath("/admin/services");

    return {
      success: true,
      message: "서비스가 수정되었습니다.",
    };
  } catch (error) {
    console.error("updateService error:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "서비스 수정 중 오류가 발생했습니다.",
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
      throw new Error(`서비스 조회 실패: ${fetchError?.message || "서비스를 찾을 수 없습니다"}`);
    }

    const existing = existingService as { image_path: string; image_after_path: string };

    const { error: deleteError } = await supabase
      .from("services")
      .delete()
      .eq("id", serviceId);

    if (deleteError) {
      throw new Error(`서비스 삭제 실패: ${deleteError.message}`);
    }

    if (existing.image_path) await deleteImage(BUCKET, existing.image_path);
    if (existing.image_after_path) await deleteImage(BUCKET, existing.image_after_path);

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
      error:
        error instanceof Error ? error.message : "서비스 삭제 중 오류가 발생했습니다.",
    };
  }
}

/**
 * 서비스 게시 상태 토글 Server Action
 */
export async function toggleServicePublish(
  serviceId: string,
  isPublished: boolean
) {
  try {
    await getUser();

    const supabase = await createClient();
    const { error } = await supabase
      .from("services")
      .update({
        is_published: isPublished,
        updated_at: new Date().toISOString(),
      } )
      .eq("id", serviceId);

    if (error) {
      throw new Error(`게시 상태 변경 실패: ${error.message}`);
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
      error:
        error instanceof Error
          ? error.message
          : "게시 상태 변경 중 오류가 발생했습니다.",
    };
  }
}
