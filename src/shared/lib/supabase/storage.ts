export interface ImageTransformOptions {
  width?: number;
  quality?: number;
  format?: "webp" | "avif" | "jpeg" | "png" | "origin";
}

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
