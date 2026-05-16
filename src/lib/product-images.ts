import qstudioGoldImg from "@/assets/products/qstudio-gold.png";
import qstudioSilverImg from "@/assets/products/qstudio-silver.png";

/** Bundled QStudio box art (works on Cloudflare Workers + D1 API responses). */
export const PRODUCT_IMAGES = {
  qstudioGold: qstudioGoldImg.src,
  qstudioSilver: qstudioSilverImg.src,
} as const;

export function planProductImage(plan: "silver" | "gold"): string {
  return plan === "gold" ? PRODUCT_IMAGES.qstudioGold : PRODUCT_IMAGES.qstudioSilver;
}

/** Fill missing image_url for known products (DB often has null). */
export function resolveProductImageUrl(product: {
  slug?: string | null;
  route?: string | null;
  imageUrl?: string | null;
}): string | null {
  const existing = product.imageUrl?.trim();
  if (existing) return existing;

  const slug = (product.slug ?? "").toLowerCase();
  const route = (product.route ?? "").toLowerCase();

  if (
    slug === "qstudio" ||
    slug === "qustodio" ||
    route === "qstudio-app" ||
    route === "qustodio-app"
  ) {
    return PRODUCT_IMAGES.qstudioGold;
  }

  return null;
}
