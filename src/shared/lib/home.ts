import { createStaticClient } from "@/shared/lib/supabase/static";
import { getServiceImageUrl } from "@/shared/lib/supabase/storage";
import type {
  CustomerReviewRow,
  Review,
  Service,
} from "@/shared/types/database";

export type ServiceWithImageUrls = {
  id: string;
  title: string;
  description: string;
  category: string;
  tags: string[];
  imageUrl: string;
  afterImageUrl?: string;
  detailImageUrl?: string;
  detailAfterImageUrl?: string;
  focalX: number;
  focalY: number;
  afterFocalX: number;
  afterFocalY: number;
  created_at: string;
  updated_at: string;
};

export async function getPublishedReviews(): Promise<Review[]> {
  try {
    const supabase = createStaticClient();
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

export async function getPublishedServicesWithImageUrls(): Promise<
  ServiceWithImageUrls[]
> {
  try {
    const supabase = createStaticClient();
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
      category: s.category,
      tags: s.tags ?? [],
      imageUrl: getServiceImageUrl(s.image_path),
      afterImageUrl: s.image_after_path
        ? getServiceImageUrl(s.image_after_path)
        : undefined,
      detailImageUrl: s.detail_image_path
        ? getServiceImageUrl(s.detail_image_path)
        : undefined,
      detailAfterImageUrl: s.detail_image_after_path
        ? getServiceImageUrl(s.detail_image_after_path)
        : undefined,
      focalX: s.image_focal_x,
      focalY: s.image_focal_y,
      afterFocalX: s.image_after_focal_x ?? 50,
      afterFocalY: s.image_after_focal_y ?? 50,
      created_at: s.created_at,
      updated_at: s.updated_at,
    }));
  } catch (err) {
    console.error("[getPublishedServicesWithImageUrls] Unexpected error:", err);
    return [];
  }
}

/** 고객 리뷰 전체 조회 — ISR 호환, 최신순 정렬 */
export async function getCustomerReviews(): Promise<CustomerReviewRow[]> {
  try {
    const supabase = createStaticClient();
    const { data, error } = await supabase
      .from("customer_reviews")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("[getCustomerReviews] DB error:", error);
      return [];
    }

    return (data as CustomerReviewRow[] | null) ?? [];
  } catch (err) {
    console.error("[getCustomerReviews] Unexpected error:", err);
    return [];
  }
}
