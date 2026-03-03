/**
 * Supabase Storage 공개 URL 생성 유틸리티
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
