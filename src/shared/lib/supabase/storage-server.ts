/**
 * Supabase Storage 서버 전용 유틸리티
 * Server Action에서 이미지 업로드/삭제에 사용합니다.
 */

import { createClient } from "@/shared/lib/supabase/server";

const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
] as const;

const ALLOWED_EXTENSIONS = ["jpg", "jpeg", "png", "webp", "gif"] as const;

const MAX_UPLOAD_SIZE = 10 * 1024 * 1024; // 10MB

type AllowedMimeType = (typeof ALLOWED_MIME_TYPES)[number];
type AllowedExtension = (typeof ALLOWED_EXTENSIONS)[number];

function isAllowedMimeType(value: string): value is AllowedMimeType {
  return (ALLOWED_MIME_TYPES as readonly string[]).includes(value);
}

function isAllowedExtension(value: string): value is AllowedExtension {
  return (ALLOWED_EXTENSIONS as readonly string[]).includes(value);
}

/**
 * 이미지 파일을 Supabase Storage에 업로드
 * @param bucket - Storage 버킷 이름 (e.g. "review-images", "service-images")
 * @param file - 업로드할 파일
 * @returns 저장된 파일명
 */
export async function uploadImage(bucket: string, file: File): Promise<string> {
  if (!isAllowedMimeType(file.type)) {
    throw new Error(
      `허용되지 않는 파일 형식입니다: ${file.type}. 허용 형식: ${ALLOWED_MIME_TYPES.join(", ")}`,
    );
  }

  const fileExt = file.name.split(".").pop();

  if (fileExt === undefined || !isAllowedExtension(fileExt.toLowerCase())) {
    throw new Error(
      `허용되지 않는 파일 확장자입니다: ${fileExt ?? "(없음)"}. 허용 확장자: ${ALLOWED_EXTENSIONS.join(", ")}`,
    );
  }

  if (file.size > MAX_UPLOAD_SIZE) {
    throw new Error(
      `파일 크기가 제한을 초과합니다: ${(file.size / 1024 / 1024).toFixed(1)}MB. 최대 허용 크기: 10MB`,
    );
  }

  const supabase = await createClient();
  const fileName = `${crypto.randomUUID()}.${fileExt}`;

  const { error } = await supabase.storage.from(bucket).upload(fileName, file, {
    cacheControl: "31536000",
    upsert: false,
  });

  if (error) {
    console.error("uploadImage storage error:", error);
    throw new Error("이미지 업로드 중 오류가 발생했습니다.");
  }

  return fileName;
}

/**
 * Supabase Storage에서 이미지 삭제
 * @param bucket - Storage 버킷 이름
 * @param imagePath - 삭제할 이미지 경로
 */
export async function deleteImage(
  bucket: string,
  imagePath: string,
): Promise<void> {
  if (!imagePath) return;

  const supabase = await createClient();
  const { error } = await supabase.storage.from(bucket).remove([imagePath]);

  if (error) {
    console.error("이미지 삭제 실패:", error.message);
    // 이미지 삭제 실패는 치명적이지 않으므로 에러를 throw하지 않음
  }
}
