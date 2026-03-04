/**
 * Supabase Storage 공개 URL 생성 유틸리티
 * 클라이언트/서버 양쪽에서 사용 가능한 순수 함수만 포함합니다.
 * 서버 전용 업로드/삭제 함수는 storage-server.ts를 참조하세요.
 */

/**
 * 리뷰 이미지의 공개 URL 반환
 * @param imagePath - Storage에 저장된 이미지 경로
 * @returns 공개 URL 또는 placeholder 경로
 */
export function getReviewImageUrl(imagePath: string): string {
  if (!imagePath || imagePath.trim() === "") {
    return "/images/reviews/placeholder.webp";
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  return `${supabaseUrl}/storage/v1/object/public/review-images/${imagePath}`;
}

/**
 * 서비스 이미지의 공개 URL 반환
 */
export function getServiceImageUrl(imagePath: string): string {
  if (!imagePath || imagePath.trim() === "") {
    return "/images/services/residential.webp";
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  return `${supabaseUrl}/storage/v1/object/public/service-images/${imagePath}`;
}
