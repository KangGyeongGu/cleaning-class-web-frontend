"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/shared/lib/supabase/server";
import { reviewFormSchema } from "@/shared/lib/schema";
import type { ReviewInsert, ReviewUpdate } from "@/shared/types/database";

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
 * 이미지 파일 Supabase Storage 업로드
 */
async function uploadImage(file: File): Promise<string> {
  const supabase = await createClient();
  const fileExt = file.name.split(".").pop();
  const fileName = `${crypto.randomUUID()}.${fileExt}`;

  const { error } = await supabase.storage
    .from("review-images")
    .upload(fileName, file, {
      cacheControl: "3600",
      upsert: false,
    });

  if (error) {
    throw new Error(`이미지 업로드 실패: ${error.message}`);
  }

  return fileName;
}

/**
 * Supabase Storage 이미지 삭제
 */
async function deleteImage(imagePath: string): Promise<void> {
  if (!imagePath) return;

  const supabase = await createClient();
  const { error } = await supabase.storage
    .from("review-images")
    .remove([imagePath]);

  if (error) {
    console.error("이미지 삭제 실패:", error.message);
    // 이미지 삭제 실패는 치명적이지 않으므로 에러를 throw하지 않음
  }
}

/**
 * 리뷰 생성 Server Action
 */
export async function createReview(prevState: unknown, formData: FormData) {
  try {
    // 1. 인증 확인
    await getUser();

    // 2. FormData 파싱
    const rawData = {
      title: formData.get("title"),
      summary: formData.get("summary"),
      tags: formData.get("tags")
        ? JSON.parse(formData.get("tags") as string)
        : [],
      sort_order: Number(formData.get("sort_order") || 0),
      is_published: formData.get("is_published") === "true",
    };

    // 3. Zod 검증
    const validationResult = reviewFormSchema.safeParse(rawData);
    if (!validationResult.success) {
      return {
        success: false,
        errors: validationResult.error.flatten().fieldErrors,
      };
    }

    // 4. 이미지 업로드
    const imageFile = formData.get("image") as File | null;
    let imagePath = "";

    if (imageFile && imageFile.size > 0) {
      imagePath = await uploadImage(imageFile);
    }

    // 5. DB INSERT
    const supabase = await createClient();
    const reviewData: ReviewInsert = {
      ...validationResult.data,
      image_path: imagePath,
    };

    const { error } = await supabase
      .from("reviews")
      .insert(reviewData as never);

    if (error) {
      // 실패 시 업로드된 이미지 삭제
      if (imagePath) {
        await deleteImage(imagePath);
      }
      throw new Error(`리뷰 등록 실패: ${error.message}`);
    }

    // 6. 캐시 무효화
    revalidatePath("/");
    revalidatePath("/admin/reviews");

    return {
      success: true,
      message: "리뷰가 등록되었습니다.",
    };
  } catch (error) {
    console.error("createReview error:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "리뷰 등록 중 오류가 발생했습니다.",
    };
  }
}

/**
 * 리뷰 수정 Server Action
 */
export async function updateReview(
  reviewId: string,
  prevState: unknown,
  formData: FormData
) {
  try {
    // 1. 인증 확인
    await getUser();

    // 2. FormData 파싱
    const rawData = {
      title: formData.get("title"),
      summary: formData.get("summary"),
      tags: formData.get("tags")
        ? JSON.parse(formData.get("tags") as string)
        : [],
      sort_order: Number(formData.get("sort_order") || 0),
      is_published: formData.get("is_published") === "true",
    };

    // 3. Zod 검증
    const validationResult = reviewFormSchema.safeParse(rawData);
    if (!validationResult.success) {
      return {
        success: false,
        errors: validationResult.error.flatten().fieldErrors,
      };
    }

    const supabase = await createClient();

    // 4. 기존 리뷰 조회
    const { data: existingReview, error: fetchError } = await supabase
      .from("reviews")
      .select("image_path")
      .eq("id", reviewId)
      .single();

    if (fetchError || !existingReview) {
      throw new Error(`리뷰 조회 실패: ${fetchError?.message || "리뷰를 찾을 수 없습니다"}`);
    }

    const existingImagePath = (existingReview as { image_path: string }).image_path;

    // 5. 이미지 교체 처리
    const imageFile = formData.get("image") as File | null;
    let newImagePath = existingImagePath;

    if (imageFile && imageFile.size > 0) {
      // 기존 이미지 삭제
      if (existingImagePath) {
        await deleteImage(existingImagePath);
      }
      // 새 이미지 업로드
      newImagePath = await uploadImage(imageFile);
    }

    // 6. DB UPDATE
    const reviewData: ReviewUpdate = {
      ...validationResult.data,
      image_path: newImagePath,
      updated_at: new Date().toISOString(),
    };

    const { error: updateError } = await supabase
      .from("reviews")
      .update(reviewData as never)
      .eq("id", reviewId);

    if (updateError) {
      // 실패 시 새 이미지 삭제 (기존 이미지와 다른 경우)
      if (newImagePath !== existingImagePath) {
        await deleteImage(newImagePath);
      }
      throw new Error(`리뷰 수정 실패: ${updateError.message}`);
    }

    // 7. 캐시 무효화
    revalidatePath("/");
    revalidatePath("/admin/reviews");

    return {
      success: true,
      message: "리뷰가 수정되었습니다.",
    };
  } catch (error) {
    console.error("updateReview error:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "리뷰 수정 중 오류가 발생했습니다.",
    };
  }
}

/**
 * 리뷰 삭제 Server Action
 */
export async function deleteReview(reviewId: string) {
  try {
    // 1. 인증 확인
    await getUser();

    const supabase = await createClient();

    // 2. 기존 리뷰 조회 (이미지 경로 확인)
    const { data: existingReview, error: fetchError } = await supabase
      .from("reviews")
      .select("image_path")
      .eq("id", reviewId)
      .single();

    if (fetchError || !existingReview) {
      throw new Error(`리뷰 조회 실패: ${fetchError?.message || "리뷰를 찾을 수 없습니다"}`);
    }

    const existingImagePath = (existingReview as { image_path: string }).image_path;

    // 3. DB DELETE
    const { error: deleteError } = await supabase
      .from("reviews")
      .delete()
      .eq("id", reviewId);

    if (deleteError) {
      throw new Error(`리뷰 삭제 실패: ${deleteError.message}`);
    }

    // 4. Storage 이미지 삭제
    if (existingImagePath) {
      await deleteImage(existingImagePath);
    }

    // 5. 캐시 무효화
    revalidatePath("/");
    revalidatePath("/admin/reviews");

    return {
      success: true,
      message: "리뷰가 삭제되었습니다.",
    };
  } catch (error) {
    console.error("deleteReview error:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "리뷰 삭제 중 오류가 발생했습니다.",
    };
  }
}

/**
 * 리뷰 게시 상태 토글 Server Action
 */
export async function toggleReviewPublish(
  reviewId: string,
  isPublished: boolean
) {
  try {
    // 1. 인증 확인
    await getUser();

    // 2. DB UPDATE
    const supabase = await createClient();
    const { error } = await supabase
      .from("reviews")
      .update({
        is_published: isPublished,
        updated_at: new Date().toISOString(),
      } as never)
      .eq("id", reviewId);

    if (error) {
      throw new Error(`게시 상태 변경 실패: ${error.message}`);
    }

    // 3. 캐시 무효화
    revalidatePath("/");
    revalidatePath("/admin/reviews");

    return {
      success: true,
      message: `리뷰가 ${isPublished ? "게시" : "비공개"}되었습니다.`,
    };
  } catch (error) {
    console.error("toggleReviewPublish error:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "게시 상태 변경 중 오류가 발생했습니다.",
    };
  }
}
