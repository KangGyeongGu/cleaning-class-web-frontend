/**
 * Supabase Storage 공개 URL 생성 유틸리티
 * 클라이언트/서버 양쪽에서 사용 가능한 순수 함수만 포함합니다.
 * 서버 전용 업로드/삭제 함수는 storage-server.ts를 참조하세요.
 */

/**
 * Supabase Storage 이미지 transform 옵션
 * @see https://supabase.com/docs/guides/storage/serving/image-transformations
 */
export interface ImageTransformOptions {
  /** 변환할 너비 (px) */
  width?: number;
  /** 이미지 품질 (1-100) */
  quality?: number;
  /** 출력 포맷 */
  format?: "webp" | "avif" | "jpeg" | "png" | "origin";
}

/**
 * transform 옵션을 Supabase render/image URL로 변환
 * /storage/v1/object/public → /storage/v1/render/image/public
 */
function buildTransformUrl(
  baseUrl: string,
  options: ImageTransformOptions,
): string {
  const renderUrl = baseUrl.replace(
    "/storage/v1/object/public/",
    "/storage/v1/render/image/public/",
  );

  const params = new URLSearchParams();
  if (options.width !== undefined) params.set("width", String(options.width));
  if (options.quality !== undefined)
    params.set("quality", String(options.quality));
  if (options.format !== undefined) params.set("format", options.format);

  const query = params.toString();
  return query ? `${renderUrl}?${query}` : renderUrl;
}

/**
 * 리뷰 이미지의 공개 URL 반환
 * @param imagePath - Storage에 저장된 이미지 경로
 * @param transform - 이미지 transform 옵션 (기본값: width=480, quality=75, format=webp)
 * @returns 공개 URL 또는 placeholder 경로
 */
export function getReviewImageUrl(
  imagePath: string,
  transform?: ImageTransformOptions,
): string {
  if (!imagePath || imagePath.trim() === "") {
    return "/images/reviews/placeholder.webp";
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!supabaseUrl) return "";
  const rawUrl = `${supabaseUrl}/storage/v1/object/public/review-images/${imagePath}`;
  return transform ? buildTransformUrl(rawUrl, transform) : rawUrl;
}

/**
 * 서비스 이미지의 공개 URL 반환
 * @param imagePath - Storage에 저장된 이미지 경로
 * @param transform - 이미지 transform 옵션 (기본값: width=480, quality=75, format=webp)
 * @returns 공개 URL 또는 fallback 경로
 */
export function getServiceImageUrl(
  imagePath: string,
  transform?: ImageTransformOptions,
): string {
  if (!imagePath || imagePath.trim() === "") {
    return "/images/services/residential.webp";
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!supabaseUrl) return "";
  const rawUrl = `${supabaseUrl}/storage/v1/object/public/service-images/${imagePath}`;
  return transform ? buildTransformUrl(rawUrl, transform) : rawUrl;
}
