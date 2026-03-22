import { createClient } from "@/shared/lib/supabase/server";
import { getServiceImageUrl } from "@/shared/lib/supabase/storage";
import type { Review, Service } from "@/shared/types/database";

export type ServiceWithImageUrls = {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  afterImageUrl?: string;
  focalX: number;
  focalY: number;
  afterFocalX: number;
  afterFocalY: number;
};

/**
 * 공개된 리뷰 목록을 sort_order 기준으로 조회합니다.
 * 오류 발생 시 빈 배열을 반환합니다.
 */
export async function getPublishedReviews(): Promise<Review[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("reviews")
      .select("*")
      .eq("is_published", true)
      .order("sort_order", { ascending: true });

    if (error) {
      console.error("[getPublishedReviews] DB error:", error);
      return [];
    }

    return (data as Review[] | null) ?? [];
  } catch (err) {
    console.error("[getPublishedReviews] Unexpected error:", err);
    return [];
  }
}

/**
 * 공개된 서비스 목록을 sort_order 기준으로 조회하고, 이미지 URL을 매핑하여 반환합니다.
 * 오류 발생 시 빈 배열을 반환합니다.
 */
export async function getPublishedServicesWithImageUrls(): Promise<
  ServiceWithImageUrls[]
> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("services")
      .select("*")
      .eq("is_published", true)
      .order("sort_order", { ascending: true });

    if (error) {
      console.error("[getPublishedServicesWithImageUrls] DB error:", error);
      return [];
    }

    const services = (data as Service[] | null) ?? [];

    return services.map((s) => ({
      id: s.id,
      title: s.title,
      description: s.description,
      imageUrl: getServiceImageUrl(s.image_path),
      afterImageUrl: s.image_after_path
        ? getServiceImageUrl(s.image_after_path)
        : undefined,
      focalX: s.image_focal_x,
      focalY: s.image_focal_y,
      afterFocalX: s.image_after_focal_x ?? 50,
      afterFocalY: s.image_after_focal_y ?? 50,
    }));
  } catch (err) {
    console.error("[getPublishedServicesWithImageUrls] Unexpected error:", err);
    return [];
  }
}
