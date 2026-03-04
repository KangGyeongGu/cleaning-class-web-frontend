/**
 * Supabase Storage 서버 전용 유틸리티
 * Server Action에서 이미지 업로드/삭제에 사용합니다.
 */

import { createClient } from "@/shared/lib/supabase/server";

/**
 * 이미지 파일을 Supabase Storage에 업로드
 * @param bucket - Storage 버킷 이름 (e.g. "review-images", "service-images")
 * @param file - 업로드할 파일
 * @returns 저장된 파일명
 */
export async function uploadImage(bucket: string, file: File): Promise<string> {
  const supabase = await createClient();
  const fileExt = file.name.split(".").pop();
  const fileName = `${crypto.randomUUID()}.${fileExt}`;

  const { error } = await supabase.storage
    .from(bucket)
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
 * Supabase Storage에서 이미지 삭제
 * @param bucket - Storage 버킷 이름
 * @param imagePath - 삭제할 이미지 경로
 */
export async function deleteImage(bucket: string, imagePath: string): Promise<void> {
  if (!imagePath) return;

  const supabase = await createClient();
  const { error } = await supabase.storage
    .from(bucket)
    .remove([imagePath]);

  if (error) {
    console.error("이미지 삭제 실패:", error.message);
    // 이미지 삭제 실패는 치명적이지 않으므로 에러를 throw하지 않음
  }
}
