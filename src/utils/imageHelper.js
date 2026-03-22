import { apiClient } from "../api/client";

/**
 * Checks if a string is a full URL (signed or public) vs a raw storage path.
 */
function isFullUrl(str) {
  return typeof str === "string" && (str.startsWith("http://") || str.startsWith("https://"));
}

/**
 * Given a product's images array (which may contain signed URLs or raw storage paths),
 * returns resolved URLs. If images are already URLs, returns them as-is.
 * If they're raw paths, fetches the product via GET /products/:id which returns signed URLs.
 */
export async function resolveProductImages(product) {
  if (!product || !product.images || product.images.length === 0) return [];

  // If first image is already a full URL, all are (backend resolves all or none)
  if (isFullUrl(product.images[0])) return product.images;

  // Raw storage paths — fetch via public endpoint which resolves to signed URLs
  try {
    const data = await apiClient(`/products/${product.id}`);
    const resolved = data.data || data;
    return resolved.images || [];
  } catch {
    return [];
  }
}

/**
 * Returns the first image URL for display, or placeholder if none.
 * Synchronous — uses whatever is available (may be a raw path).
 * For guaranteed URLs, use resolveProductImages() async.
 */
export function getProductImageSrc(product) {
  if (!product?.images?.length) return "/placeholder.svg";
  const first = product.images[0];
  if (isFullUrl(first)) return first;
  // Raw path — can't display directly, return placeholder
  return "/placeholder.svg";
}
