"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/shared/lib/supabase/server";
import { getUser } from "@/shared/lib/supabase/auth";
import { uploadImage, deleteImage } from "@/shared/lib/supabase/storage-server";
import { reviewFormSchema } from "@/shared/lib/schema";
import type { ReviewInsert, ReviewUpdate } from "@/shared/types/database";

const BUCKET = "review-images";

/**
 * 리뷰 생성 Server Action
 */
export async function createReview(prevState: unknown, formData: FormData) {
  try {
    // 1. 인증 확인
    await getUser();

    // 2. FormData 파싱
    let parsedTags: unknown;
    try {
      parsedTags = formData.get("tags")
        ? JSON.parse(formData.get("tags") as string)
        : [];
    } catch {
      return {
        success: false,
        errors: { tags: ["올바른 태그 형식이 아닙니다."] },
      };
    }

    const rawData = {
      title: formData.get("title"),
      summary: formData.get("summary"),
      tags: parsedTags,
      link_url: formData.get("link_url") || "",
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

    // 4. 이미지 업로드 (필수)
    const imageFile = formData.get("image") as File | null;
    if (!imageFile || imageFile.size === 0) {
      return { success: false, error: "이미지를 선택해주세요." };
    }
    let imagePath = "";

    if (imageFile && imageFile.size > 0) {
      imagePath = await uploadImage(BUCKET, imageFile);
    }

    // 5. DB INSERT
    const supabase = await createClient();
    const reviewData: ReviewInsert = {
      ...validationResult.data,
      image_path: imagePath,
    };

    const { error } = await supabase.from("reviews").insert(reviewData);

    if (error) {
      // 실패 시 업로드된 이미지 삭제
      if (imagePath) {
        await deleteImage(BUCKET, imagePath);
      }
      console.error("createReview DB error:", error);
      throw new Error("리뷰 처리 중 오류가 발생했습니다.");
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
      error: "리뷰 처리 중 오류가 발생했습니다.",
    };
  }
}

/**
 * 리뷰 수정 Server Action
 */
export async function updateReview(
  reviewId: string,
  prevState: unknown,
  formData: FormData,
) {
  try {
    // 1. 인증 확인
    await getUser();

    // 2. FormData 파싱
    let parsedTagsUpdate: unknown;
    try {
      parsedTagsUpdate = formData.get("tags")
        ? JSON.parse(formData.get("tags") as string)
        : [];
    } catch {
      return {
        success: false,
        errors: { tags: ["올바른 태그 형식이 아닙니다."] },
      };
    }

    const rawData = {
      title: formData.get("title"),
      summary: formData.get("summary"),
      tags: parsedTagsUpdate,
      link_url: formData.get("link_url") || "",
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
      console.error("updateReview fetch error:", fetchError);
      throw new Error("리뷰 처리 중 오류가 발생했습니다.");
    }

    const existingImagePath = (existingReview as { image_path: string })
      .image_path;

    // 5. 이미지 교체 처리
    const imageFile = formData.get("image") as File | null;
    let newImagePath = existingImagePath;

    if (imageFile && imageFile.size > 0) {
      // 새 이미지 업로드 먼저 (기존 이미지는 DB UPDATE 성공 후 삭제)
      newImagePath = await uploadImage(BUCKET, imageFile);
    }

    // 6. DB UPDATE
    const reviewData: ReviewUpdate = {
      ...validationResult.data,
      image_path: newImagePath,
      updated_at: new Date().toISOString(),
    };

    const { error: updateError } = await supabase
      .from("reviews")
      .update(reviewData)
      .eq("id", reviewId);

    if (updateError) {
      // 실패 시 새로 업로드된 이미지만 삭제 (기존 이미지는 건드리지 않음)
      if (newImagePath !== existingImagePath) {
        await deleteImage(BUCKET, newImagePath);
      }
      console.error("updateReview DB error:", updateError);
      throw new Error("리뷰 처리 중 오류가 발생했습니다.");
    }

    // DB UPDATE 성공 시 기존 이미지 삭제
    if (
      imageFile &&
      imageFile.size > 0 &&
      existingImagePath &&
      newImagePath !== existingImagePath
    ) {
      await deleteImage(BUCKET, existingImagePath);
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
      error: "리뷰 처리 중 오류가 발생했습니다.",
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
      console.error("deleteReview fetch error:", fetchError);
      throw new Error("리뷰 처리 중 오류가 발생했습니다.");
    }

    const existingImagePath = (existingReview as { image_path: string })
      .image_path;

    // 3. DB DELETE
    const { error: deleteError } = await supabase
      .from("reviews")
      .delete()
      .eq("id", reviewId);

    if (deleteError) {
      console.error("deleteReview DB error:", deleteError);
      throw new Error("리뷰 처리 중 오류가 발생했습니다.");
    }

    // 4. Storage 이미지 삭제
    if (existingImagePath) {
      await deleteImage(BUCKET, existingImagePath);
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
      error: "리뷰 처리 중 오류가 발생했습니다.",
    };
  }
}

/**
 * 리뷰 게시 상태 토글 Server Action
 */
export async function toggleReviewPublish(
  reviewId: string,
  isPublished: boolean,
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
      })
      .eq("id", reviewId);

    if (error) {
      console.error("toggleReviewPublish DB error:", error);
      throw new Error("리뷰 처리 중 오류가 발생했습니다.");
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
      error: "리뷰 처리 중 오류가 발생했습니다.",
    };
  }
}

/**
 * 리뷰 순서 일괄 변경 Server Action
 */
export async function reorderReviews(
  orderedIds: string[],
): Promise<{ success: boolean; error?: string }> {
  try {
    const user = await getUser();
    if (!user) {
      return { success: false, error: "인증이 필요합니다." };
    }

    const supabase = await createClient();

    // 배치 upsert로 sort_order를 원자적으로 일괄 갱신 — 개별 UPDATE 루프의 부분 실패 위험 제거
    // Supabase upsert 타입 시그니처가 Insert 타입을 요구하지만, 런타임에서는 id 기준으로 기존 행만 갱신함
    const upsertRows = orderedIds.map((id, i) => ({
      id,
      sort_order: i,
    })) as unknown as ReviewInsert[];
    const { error } = await supabase.from("reviews").upsert(upsertRows);

    if (error) {
      console.error("reorderReviews DB error:", error);
      return { success: false, error: "순서 변경 중 오류가 발생했습니다." };
    }

    revalidatePath("/");
    revalidatePath("/admin/reviews");

    return { success: true };
  } catch (error) {
    console.error("reorderReviews error:", error);
    return { success: false, error: "순서 변경 중 오류가 발생했습니다." };
  }
}
