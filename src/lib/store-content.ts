/**
 * Public storefront copy & media — controlled in code (not SuperAdmin DB).
 * Deploy updates the live site; D1 `settings` table does not override the home hero.
 */
import { PRODUCT_IMAGES } from "@/lib/product-images";

export const HERO_CONTENT = {
  hero_title: "متجر Carely.tn 🛍️",
  hero_subtitle: "حسابات التطبيقات المدفوعة بالدينار التونسي",
  hero_description:
    "تسوّق اشتراكات رسمية للتطبيقات اللي تحتاجها عيلتك — دفع بالدينار، تفعيل واضح، ودعم مباشر على واتساب",
  hero_subdescription: "من تونس لكل تونسي 🇹🇳",
  cta_primary_text: "شوف المنتجات",
  cta_secondary_text: "تواصل معانا",
  hero_image: PRODUCT_IMAGES.qstudioGold,
} as const;

export const TRUST_BADGES = [
  "حسابات أصلية 100%",
  "دفع بالدينار التونسي",
  "دعم على الواتساب",
  "تسليم فوري",
] as const;

/** QStudio card on home when API/DB has no image_url */
export const QSTUDIO_STORE_CARD = {
  id: "qstudio-store",
  slug: "qstudio",
  name: "QStudio",
  nameAr: "QStudio",
  description: "حماية أطفالك على النت",
  descriptionAr: "حماية أطفالك على النت",
  price: 390,
  currency: "TND",
  priceLabel: "من 390 دت / سنة",
  route: "qstudio-app",
  imageUrl: PRODUCT_IMAGES.qstudioGold,
  emoji: "🛡️",
} as const;
