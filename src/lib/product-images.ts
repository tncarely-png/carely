/** QStudio plan box art (public/) */
export const PRODUCT_IMAGES = {
  qstudioGold: "/products/qstudio-gold.png",
  qstudioSilver: "/products/qstudio-silver.png",
} as const;

export function planProductImage(plan: "silver" | "gold"): string {
  return plan === "gold" ? PRODUCT_IMAGES.qstudioGold : PRODUCT_IMAGES.qstudioSilver;
}
