/** QStudio box art — served from `public/products/` via OpenNext assets. */
export const PRODUCT_IMAGES = {
  qstudioGold: "/products/qstudio-gold.png",
  qstudioSilver: "/products/qstudio-silver.png",
} as const;

export function planProductImage(plan: "silver" | "gold"): string {
  return plan === "gold" ? PRODUCT_IMAGES.qstudioGold : PRODUCT_IMAGES.qstudioSilver;
}

/** Fill missing image_url for known products (D1 rows often have null). */
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
