export const WILAYAS = [
  "تونس", "أريانة", "بن عروس", "منوبة", "نابل", "زغوان",
  "بنزرت", "باجة", "جندوبة", "الكاف", "سليانة", "القيروان",
  "القصرين", "سيدي بوزيد", "سوسة", "المنستير", "المهدية",
  "صفاقس", "قفصة", "توزر", "قبلي", "قابس", "مدنين", "تطاوين"
];

export const PLANS = {
  silver: {
    id: "silver",
    name: "Qustodio Silver",
    displayName: "Qustodio Silver",
    nameAr: "كيرلي سيلفر",
    icon: "🥈",
    devices: 5,
    duration: "سنة كاملة (12 شهر)",
    priceTnd: 89,
    color: "#8e9eab",
    featured: false,
    features: [
      "حجب المواقع غير اللائقة",
      "تحديد وقت الشاشة",
      "تقارير أسبوعية",
      "دعم فني بالتونسي",
      "تفعيل فوري بعد الدفع",
    ],
  },
  gold: {
    id: "gold",
    name: "Qustodio Gold",
    displayName: "Qustodio Gold",
    nameAr: "كيرلي ڨولد",
    icon: "🥇",
    devices: 10,
    duration: "سنة كاملة (12 شهر)",
    priceTnd: 149,
    color: "#d4a017",
    featured: true,
    features: [
      "كل مميزات Silver",
      "مراقبة واتساب وانستغرام",
      "تتبع الموقع الجغرافي",
      "تقارير يومية مفصلة",
      "حجب مكالمات وجهات اتصال",
      "دعم VIP أولوية على واتساب",
    ],
  },
} as const;

export type PlanType = keyof typeof PLANS;

export const PAYMENT_METHODS = [
  { id: "flouci", name: "📱 Flouci", description: "حوّل على الرقم: 26107128" },
  { id: "virement", name: "🏦 Virement Bancaire", description: "RIB: 0000000000000000" },
  { id: "ccp", name: "📮 CCP", description: "CCP: 0000000000000000" },
] as const;

export const SUBSCRIPTION_STATUS = {
  active: { label: "نشط", color: "bg-green-100 text-green-800" },
  expired: { label: "منتهي", color: "bg-red-100 text-red-800" },
  pending: { label: "معلق", color: "bg-yellow-100 text-yellow-800" },
  cancelled: { label: "ملغى", color: "bg-gray-100 text-gray-800" },
} as const;

export const ORDER_STATUS = {
  pending: { label: "في الانتظار", color: "bg-yellow-100 text-yellow-800" },
  paid: { label: "مدفوع ✓", color: "bg-green-100 text-green-800" },
  failed: { label: "فشل", color: "bg-red-100 text-red-800" },
  refunded: { label: "مسترجع", color: "bg-gray-100 text-gray-800" },
} as const;

export const WHATSAPP_NUMBER = "21626107128";
export const CONTACT_EMAIL = "contact@carely.tn";

export const STORE_DESCRIPTION = "نبيعو حسابات مدفوعة آمنة لتطبيقات العيلة — من ولاية الكاف، مع إرشاد ودعم على الواتساب";
export const STORE_TAGLINE = "متجر التطبيقات المدفوعة للعيلة التونسية — من ولاية الكاف، حسابات آمنة مع دعم على الواتساب";

export function getWhatsAppLink(message?: string) {
  const msg = message || "مرحبا، أريد الاستفسار عن اشتراك Carely.tn";
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`;
}
