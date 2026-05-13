export const WILAYAS = [
  "تونس", "أريانة", "بن عروس", "منوبة", "نابل", "زغوان",
  "بنزرت", "باجة", "جندوبة", "الكاف", "سليانة", "القيروان",
  "القصرين", "سيدي بوزيد", "سوسة", "المنستير", "المهدية",
  "صفاقس", "قفصة", "توزر", "قبلي", "قابس", "مدنين", "تطاوين"
];

/** Prices and feature wording aligned with QStudio-style parental-control tiers (web/app monitoring stack). */
export const PLANS = {
  silver: {
    id: "silver",
    name: "QStudio Silver",
    displayName: "QStudio Silver",
    nameAr: "كيرلي سيلفر",
    icon: "🥈",
    devices: 5,
    duration: "سنة كاملة (12 شهر)",
    priceTnd: 390,
    color: "#8e9eab",
    featured: false,
    features: [
      "فلترة المواقع وتصنيف المحتوى غير اللائق",
      "حدود زمنية للشاشة وللتطبيقات والألعاب",
      "حظر التطبيقات والألعاب حسب الفئة",
      "تقارير نشاط يومية وأسبوعية",
      "إيقاف الإنترنت مؤقتاً (Pause) للعائلة",
      "تتبع الموقع الجغرافي",
      "حتى 5 أجهزة — دعم بالتونسي",
    ],
  },
  gold: {
    id: "gold",
    name: "QStudio Gold",
    displayName: "QStudio Gold",
    nameAr: "كيرلي ڨولد",
    icon: "🥇",
    devices: 10,
    duration: "سنة كاملة (12 شهر)",
    priceTnd: 590,
    color: "#d4a017",
    featured: true,
    features: [
      "كل مميزات Silver",
      "تنبيهات ذكية (بحث، كلمات مفتاحية، نشاط مريب)",
      "مراقبة أعمق للشبكات الاجتماعية والرسائل",
      "رؤية أوضح للتطبيقات (وقت الاستخدام والتفاصيل)",
      "جداول وجداول نوم مخصصة (روتينات)",
      "مكالمات وجهات اتصال — حسب دعم المنصة",
      "دعم VIP بأولوية على واتساب",
      "حتى 10 أجهزة",
    ],
  },
} as const;

export type PlanType = keyof typeof PLANS;

/** Shown on mobile wallets (Flouci, Wafacash, Izi Pay, etc.) */
export const PAYMENT_RECIPIENT = {
  name: "Chafik Dridi",
  phone: "26107128",
} as const;

/** Logos via Google favicon service (stable `sz` URLs per domain). */
export function paymentProviderLogoUrl(domain: string, size = 64): string {
  return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=${String(size)}`;
}

const RECIPIENT_AR = `المستفيد: ${PAYMENT_RECIPIENT.name} — الرقم: ${PAYMENT_RECIPIENT.phone}`;

export const PAYMENT_METHODS = [
  {
    id: "flouci",
    name: "Flouci",
    nameAr: "فلوسي",
    logoDomain: "flouci.com",
    description: `${RECIPIENT_AR} — أرسل عبر تطبيق Flouci`,
  },
  {
    id: "wafacash",
    name: "Wafacash",
    nameAr: "وافاكاش",
    logoDomain: "wafacash.com",
    description: `${RECIPIENT_AR} — وكالة أو تطبيق Wafacash`,
  },
  {
    id: "zitouna_izi",
    name: "Zitouna Izi Pay",
    nameAr: "زيتونة Izi Pay",
    logoDomain: "www.labanque-zitouna.com",
    description: `${RECIPIENT_AR} — عبر تطبيق Banque Zitouna / Izi Pay`,
  },
  {
    id: "virement",
    name: "Virement bancaire",
    nameAr: "حوالة بنكية",
    logoDomain: "www.bct.gov.tn",
    description: `${RECIPIENT_AR} — RIB/IBAN: تواصل معانا للبيانات البنكية`,
  },
  {
    id: "ccp",
    name: "CCP",
    nameAr: "حساب بريدي (CCP)",
    logoDomain: "www.poste.tn",
    description: `${RECIPIENT_AR} — رقم CCP: تواصل معانا للتفاصيل`,
  },
] as const;

export type PaymentMethodId = (typeof PAYMENT_METHODS)[number]["id"];

export const SUBSCRIPTION_STATUS = {
  active: { label: "نشط", color: "bg-gray-900 text-white" },
  expired: { label: "منتهي", color: "bg-red-100 text-red-800" },
  pending: { label: "معلق", color: "bg-yellow-100 text-yellow-800" },
  cancelled: { label: "ملغى", color: "bg-gray-100 text-gray-800" },
} as const;

export const ORDER_STATUS = {
  pending: { label: "في الانتظار", color: "bg-yellow-100 text-yellow-800" },
  paid: { label: "مدفوع ✓", color: "bg-gray-900 text-white" },
  failed: { label: "فشل", color: "bg-red-100 text-red-800" },
  refunded: { label: "مسترجع", color: "bg-gray-100 text-gray-800" },
} as const;

export const WHATSAPP_NUMBER = "21650496159";
export const CONTACT_EMAIL = "contact@carely.tn";

export const STORE_DESCRIPTION = "نبيعو حسابات مدفوعة آمنة لتطبيقات العيلة — من ولاية الكاف، مع إرشاد ودعم على الواتساب";
export const STORE_TAGLINE = "متجر التطبيقات المدفوعة للعيلة التونسية — من ولاية الكاف، حسابات آمنة مع دعم على الواتساب";

/**
 * Generate a WhatsApp link with the static WHATSAPP_NUMBER.
 * NOTE: For dynamic agent routing (client-side), prefer using the
 * `useWhatsAppAgent` hook from `@/hooks/useWhatsAppAgent` instead.
 * This function is kept as a fallback for server-side use only.
 */
export function getWhatsAppLink(message?: string) {
  const msg = message || "مرحبا، أريد الاستفسار عن اشتراك Carely.tn";
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`;
}
