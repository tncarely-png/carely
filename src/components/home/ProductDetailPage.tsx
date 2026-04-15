'use client';

import { useEffect, useState, useMemo } from 'react';
import { useAppStore, useAuthStore } from '@/store';
import { getWhatsAppLink, PLANS } from '@/lib/constants';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import WhatsAppFAB from '@/components/layout/WhatsAppFAB';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { ArrowLeft, Check, ShieldCheck, MessageCircle, Star, Zap, Clock, Heart, Smartphone } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

// ────────────────────────────────────────────
// Types
// ────────────────────────────────────────────

interface Product {
  id: string;
  name: string;
  nameAr: string;
  slug: string;
  description: string | null;
  descriptionAr: string | null;
  emoji: string | null;
  imageUrl: string | null;
  price: number;
  currency: string | null;
  priceLabel: string | null;
  features: string[];
  isActive: boolean;
  sortOrder: number;
  route: string | null;
  externalUrl: string | null;
  landingSections: string | null;
}

interface HeroSection {
  type: 'hero';
  emoji?: string;
  title?: string;
  subtitle?: string;
  description?: string;
  price?: string;
  priceLabel?: string;
  ctaText?: string;
}

interface FeatureItem {
  icon?: string;
  text: string;
}

interface FeaturesSection {
  type: 'features';
  title?: string;
  items: FeatureItem[];
}

interface StepItem {
  icon?: string;
  title: string;
  text: string;
}

interface HowItWorksSection {
  type: 'how-it-works';
  title?: string;
  steps: StepItem[];
}

interface TrustBadgeItem {
  icon?: string;
  text: string;
}

interface TrustBadgesSection {
  type: 'trust-badges';
  items: TrustBadgeItem[];
}

interface CTASection {
  type: 'cta';
  title?: string;
  subtitle?: string;
  ctaText?: string;
  ctaSubtext?: string;
}

interface PricingSection {
  type: 'pricing';
  title?: string;
}

type LandingSection =
  | HeroSection
  | FeaturesSection
  | HowItWorksSection
  | TrustBadgesSection
  | CTASection
  | PricingSection;

// ────────────────────────────────────────────
// Helpers
// ────────────────────────────────────────────

function parseLandingSections(raw: string | null): LandingSection[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch {
    return [];
  }
}

function buildDefaultSections(product: Product): LandingSection[] {
  const sections: LandingSection[] = [];

  // Hero
  sections.push({
    type: 'hero',
    emoji: product.emoji || undefined,
    title: product.nameAr || product.name,
    subtitle: product.name !== product.nameAr ? product.name : undefined,
    description: product.descriptionAr || product.description || undefined,
    price: product.price > 0 ? (product.priceLabel || `${product.price} ${product.currency || 'دت'}`) : undefined,
    priceLabel: product.priceLabel || undefined,
    ctaText: product.route ? 'اكتشف المزيد' : 'اطلب الآن على واتساب',
  });

  // Features
  if (product.features && product.features.length > 0) {
    sections.push({
      type: 'features',
      title: 'مميزات المنتج',
      items: product.features.map((f) => ({ text: f })),
    });
  }

  // How it works (default generic)
  sections.push({
    type: 'how-it-works',
    title: 'كيف تشري؟',
    steps: [
      {
        icon: '💬',
        title: 'تواصل معانا',
        text: 'اكتبلنا على واتساب ونردّ عليك بالحين',
      },
      {
        icon: '💳',
        title: 'ادفع بسهولة',
        text: 'ادفع بفلوسي أو تحويل بنكي أو CCP',
      },
      {
        icon: '✅',
        title: 'فعّل اشتراكك',
        text: 'نفعّلك الحساب في دقائق ونرسّلك التفاصيل',
      },
    ],
  });

  // Trust badges
  sections.push({
    type: 'trust-badges',
    items: [
      { icon: '⚡', text: 'تفعيل فوري' },
      { icon: '🛡️', text: 'ضمان 7 أيام' },
      { icon: '💬', text: 'دعم بالتونسي' },
      { icon: '🇹🇳', text: 'من تونس' },
    ],
  });

  // Pricing
  sections.push({
    type: 'pricing',
    title: 'اختار باقتك',
  });

  // CTA
  sections.push({
    type: 'cta',
    title: 'جاهز تشري؟',
    subtitle: 'لا تخلّي الفرصة تفوتك — اشتري الحين واستفيد!',
    ctaText: 'اطلب الآن',
    ctaSubtext: 'تواصل مباشرة على واتساب',
  });

  return sections;
}

// ────────────────────────────────────────────
// Sub-components for each section type
// ────────────────────────────────────────────

function SectionHero({
  data,
  product,
}: {
  data: HeroSection;
  product: Product;
}) {
  const { navigate, openWhatsAppPopup } = useAppStore();

  const emoji = data.emoji || product.emoji || '📦';
  const title = data.title || product.nameAr;
  const subtitle = data.subtitle || (product.name !== product.nameAr ? product.name : undefined);
  const description = data.description || product.descriptionAr || product.description || '';
  const priceDisplay =
    data.priceLabel ||
    (product.price > 0
      ? data.price || `${product.price.toFixed(2)} ${product.currency || 'دت'}`
      : null);
  const ctaText = data.ctaText || 'اطلب الآن';

  const waMessage = `مرحبا، أريد الاستفسار عن ${product.nameAr}${priceDisplay ? ` (${priceDisplay})` : ''}`;

  return (
    <section className="relative overflow-hidden">
      {/* Decorative background */}
      <div className="absolute inset-0 bg-gradient-to-bl from-carely-light/60 via-carely-mint to-carely-mint" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-carely-green/5 rounded-full blur-3xl -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-carely-green/5 rounded-full blur-3xl translate-y-1/2 translate-x-1/4" />

      <div className="relative mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 pt-8 pb-16 md:pt-12 md:pb-24">
        {/* Back button */}
        <div className="mb-6 md:mb-10">
          <Button
            variant="ghost"
            className="text-carely-gray hover:text-carely-green hover:bg-carely-light/50 font-medium rounded-full px-4"
            onClick={() => navigate('home')}
          >
            <ArrowLeft className="size-4 ml-1.5" />
            <span>الرئيسية</span>
          </Button>
        </div>

        {/* Hero content */}
        <div className="text-center">
          {/* Product emoji / image — PROMINENT */}
          <div className="mb-6 md:mb-8 inline-block">
            <div className="relative">
              {/* Glow ring */}
              <div className="absolute inset-0 scale-110 bg-carely-green/10 rounded-3xl blur-xl" />
              <div className="relative w-28 h-28 sm:w-36 sm:h-36 md:w-44 md:h-44 rounded-3xl bg-white shadow-2xl flex items-center justify-center overflow-hidden border border-carely-light">
                {product.imageUrl ? (
                  <img
                    src={product.imageUrl}
                    alt={title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-6xl sm:text-7xl md:text-8xl select-none">
                    {emoji}
                  </span>
                )}
              </div>
              {/* Decorative floating badges */}
              <div className="absolute -top-2 -right-2 w-10 h-10 bg-carely-green rounded-full flex items-center justify-center shadow-lg animate-bounce">
                <Star className="size-5 text-white" fill="white" />
              </div>
            </div>
          </div>

          {/* Title */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-carely-dark leading-tight mb-2">
            {title}
          </h1>

          {/* Subtitle (English name) */}
          {subtitle && (
            <p className="text-lg sm:text-xl text-carely-gray/70 font-medium mb-4" dir="ltr">
              {subtitle}
            </p>
          )}

          {/* Description */}
          {description && (
            <p className="text-base sm:text-lg text-carely-gray leading-relaxed max-w-2xl mx-auto mb-8">
              {description}
            </p>
          )}

          {/* Price badge */}
          {priceDisplay && (
            <div className="inline-flex items-center gap-2 bg-white rounded-full px-6 py-3 shadow-lg border border-carely-light mb-8">
              <span className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-carely-green">
                {priceDisplay}
              </span>
            </div>
          )}

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button
              className="carely-btn-primary text-base sm:text-lg py-3.5 sm:py-4 px-8 sm:px-10 shadow-xl shadow-carely-green/25"
              onClick={() => {
                if (product.route) {
                  navigate(product.route as any);
                } else {
                  openWhatsAppPopup(waMessage);
                }
              }}
            >
              {product.route ? (
                <>
                  <span>{ctaText}</span>
                  <ArrowLeft className="size-5 ml-2" />
                </>
              ) : (
                <>
                  <MessageCircle className="size-5 ml-2" />
                  <span>{ctaText}</span>
                </>
              )}
            </Button>

            <a
              href={getWhatsAppLink(waMessage)}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button
                variant="outline"
                className="rounded-full font-bold py-3.5 sm:py-4 px-8 border-carely-green text-carely-green hover:bg-carely-green hover:text-white transition-colors text-base sm:text-lg"
              >
                💬 واتساب مباشر
              </Button>
            </a>
          </div>
        </div>
      </div>

      {/* Bottom wave */}
      <div className="relative h-8">
        <svg
          className="absolute bottom-0 w-full"
          viewBox="0 0 1440 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="none"
        >
          <path
            d="M0 48h1440V24c-240 28-480 0-720-12S240 12 0 36v12z"
            fill="#f0faf5"
          />
        </svg>
      </div>
    </section>
  );
}

function SectionFeatures({ data }: { data: FeaturesSection }) {
  return (
    <section className="py-12 md:py-20 bg-carely-mint">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        {data.title && (
          <div className="text-center mb-10 md:mb-14">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-carely-dark mb-3">
              {data.title}
            </h2>
            <div className="w-16 h-1 bg-carely-green rounded-full mx-auto" />
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-5">
          {data.items.map((item, idx) => (
            <div
              key={idx}
              className="carely-card p-5 md:p-6 flex items-start gap-4 hover:shadow-lg transition-shadow duration-200 group"
            >
              <div className="shrink-0 w-11 h-11 md:w-12 md:h-12 rounded-xl bg-carely-mint flex items-center justify-center text-xl md:text-2xl group-hover:bg-carely-light transition-colors">
                {item.icon || '✓'}
              </div>
              <p className="text-base md:text-lg font-semibold text-carely-dark leading-relaxed pt-1.5">
                {item.text}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function SectionHowItWorks({ data }: { data: HowItWorksSection }) {
  return (
    <section className="py-12 md:py-20 bg-white">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        {data.title && (
          <div className="text-center mb-10 md:mb-14">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-carely-dark mb-3">
              {data.title}
            </h2>
            <div className="w-16 h-1 bg-carely-green rounded-full mx-auto" />
          </div>
        )}

        <div className="relative">
          {/* Connector line (desktop) */}
          <div className="hidden md:block absolute top-16 right-[16.66%] left-[16.66%] h-0.5 bg-carely-light" />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-6">
            {data.steps.map((step, idx) => (
              <div key={idx} className="text-center relative">
                {/* Step number badge */}
                <div className="relative inline-flex mb-5">
                  <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-carely-mint border-2 border-carely-light flex items-center justify-center text-3xl md:text-4xl shadow-sm">
                    {step.icon || (idx + 1)}
                  </div>
                  <div className="absolute -top-2 -left-2 w-7 h-7 bg-carely-green text-white rounded-full flex items-center justify-center text-xs font-extrabold shadow-md">
                    {idx + 1}
                  </div>
                </div>

                <h3 className="text-lg md:text-xl font-extrabold text-carely-dark mb-2">
                  {step.title}
                </h3>
                <p className="text-sm md:text-base text-carely-gray leading-relaxed max-w-xs mx-auto">
                  {step.text}
                </p>

                {/* Arrow between steps (mobile) */}
                {idx < data.steps.length - 1 && (
                  <div className="md:hidden flex justify-center my-2">
                    <ArrowLeft className="size-6 text-carely-light rotate-180" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function SectionTrustBadges({ data }: { data: TrustBadgesSection }) {
  return (
    <section className="py-12 md:py-16 bg-carely-mint">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="carely-card p-6 md:p-8">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 md:gap-6">
            {data.items.map((item, idx) => (
              <div key={idx} className="text-center flex flex-col items-center gap-2">
                <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-carely-mint flex items-center justify-center text-3xl md:text-4xl">
                  {item.icon || '✓'}
                </div>
                <span className="text-sm md:text-base font-bold text-carely-dark">
                  {item.text}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function SectionCTA({ data, product }: { data: CTASection; product: Product }) {
  const { navigate, openWhatsAppPopup } = useAppStore();

  const ctaText = data.ctaText || 'اطلب الآن';
  const waMessage = `مرحبا، أريد الاستفسار عن ${product.nameAr}`;

  return (
    <section className="py-12 md:py-20 bg-white">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl bg-carely-dark p-8 md:p-12 lg:p-16 text-center">
          {/* Decorative elements */}
          <div className="absolute top-0 left-0 w-64 h-64 bg-carely-green/20 rounded-full blur-3xl -translate-y-1/2 -translate-x-1/2" />
          <div className="absolute bottom-0 right-0 w-48 h-48 bg-carely-green/15 rounded-full blur-3xl translate-y-1/2 translate-x-1/4" />
          <div className="absolute top-4 left-6 text-white/10 text-6xl">🛒</div>
          <div className="absolute bottom-6 right-6 text-white/10 text-5xl">🎯</div>

          <div className="relative">
            {data.title && (
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white mb-3">
                {data.title}
              </h2>
            )}
            {data.subtitle && (
              <p className="text-base sm:text-lg text-carely-light/80 mb-8 max-w-xl mx-auto leading-relaxed">
                {data.subtitle}
              </p>
            )}

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Button
                className="bg-white text-carely-dark hover:bg-carely-light font-extrabold rounded-full py-3.5 sm:py-4 px-8 sm:px-10 text-base sm:text-lg shadow-xl hover:shadow-2xl transition-all hover:-translate-y-0.5"
                onClick={() => {
                  if (product.route) {
                    navigate(product.route as any);
                  } else {
                    openWhatsAppPopup(waMessage);
                  }
                }}
              >
                {product.route ? (
                  <>
                    <span>{ctaText}</span>
                    <ArrowLeft className="size-5 ml-2" />
                  </>
                ) : (
                  <>
                    <MessageCircle className="size-5 ml-2" />
                    <span>{ctaText}</span>
                  </>
                )}
              </Button>

              <Button
                variant="outline"
                className="border-white/30 text-white hover:bg-white/10 hover:text-white rounded-full font-bold py-3.5 sm:py-4 px-8 text-base sm:text-lg transition-colors"
                onClick={() => navigate('contact')}
              >
                💬 تواصل معانا
              </Button>
            </div>

            {data.ctaSubtext && (
              <p className="mt-4 text-sm text-carely-light/50">
                {data.ctaSubtext}
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function SectionPricing({ data }: { data: PricingSection }) {
  const { setSelectedPlan, navigate } = useAppStore();
  const { user } = useAuthStore();

  const handleBuy = (planKey: 'silver' | 'gold') => {
    setSelectedPlan(planKey);
    if (user) {
      navigate('checkout');
    } else {
      navigate('login');
    }
  };

  return (
    <section className="py-12 md:py-20 bg-white">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10 md:mb-14">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-carely-dark mb-3">
            {data.title || 'اختار باقتك'}
          </h2>
          <p className="text-base sm:text-lg text-carely-gray max-w-xl mx-auto">
            اختار الباقة اللي تناسبك — اشتري الآن وفعّل الحساب في دقائق
          </p>
          <div className="w-16 h-1 bg-carely-green rounded-full mx-auto mt-4" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {(['silver', 'gold'] as const).map((key) => {
            const plan = PLANS[key];
            return (
              <Card
                key={key}
                className={`relative transition-all hover:shadow-lg ${
                  plan.featured ? 'carely-card-featured' : 'carely-card'
                }`}
              >
                {plan.featured && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-carely-gold text-white text-xs font-bold px-3 py-1 rounded-full">
                    ⭐ الأكثر شراءً
                  </div>
                )}
                <CardContent className="p-5 sm:p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="text-3xl">{plan.icon}</div>
                    <div>
                      <h3 className="text-lg font-bold text-carely-dark">{plan.nameAr}</h3>
                      <p className="text-xs text-carely-gray">{plan.duration}</p>
                    </div>
                  </div>

                  <div className="mb-4">
                    <span className="text-3xl font-extrabold text-carely-green">{plan.priceTnd}</span>
                    <span className="text-sm text-carely-gray mr-1">دت / سنة</span>
                  </div>

                  <div className="flex items-center gap-2 mb-4">
                    <Badge variant="secondary" className="bg-carely-mint text-carely-dark font-semibold">
                      <Smartphone className="h-3.5 w-3.5 ml-1" />
                      {plan.devices} أجهزة
                    </Badge>
                  </div>

                  <Separator className="my-4" />

                  <ul className="space-y-2.5">
                    {plan.features.map((f, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-carely-gray">
                        <Check className="h-4 w-4 text-carely-green shrink-0 mt-0.5" />
                        {f}
                      </li>
                    ))}
                  </ul>

                  <Button
                    className={`w-full mt-5 h-11 text-sm font-bold ${
                      plan.featured ? 'carely-btn-primary' : 'carely-btn-outline'
                    }`}
                    onClick={() => handleBuy(key)}
                  >
                    اشتري
                    <ArrowLeft className="h-4 w-4 mr-1.5" />
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ────────────────────────────────────────────
// Loading skeleton
// ────────────────────────────────────────────

function LoadingSkeleton() {
  return (
    <div className="min-h-screen bg-carely-mint">
      {/* Hero skeleton */}
      <div className="bg-gradient-to-bl from-carely-light/60 via-carely-mint to-carely-mint">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 pt-8 pb-16 md:pt-12 md:pb-24">
          <Skeleton className="h-10 w-32 mb-8 rounded-full" />
          <div className="text-center">
            <Skeleton className="w-28 h-28 sm:w-36 sm:h-36 rounded-3xl mx-auto mb-6" />
            <Skeleton className="h-10 w-64 mx-auto mb-3 rounded-xl" />
            <Skeleton className="h-6 w-48 mx-auto mb-4 rounded-lg" />
            <Skeleton className="h-5 w-full max-w-2xl mx-auto mb-6 rounded-lg" />
            <Skeleton className="h-14 w-48 mx-auto mb-8 rounded-full" />
            <div className="flex gap-3 justify-center">
              <Skeleton className="h-12 w-52 rounded-full" />
              <Skeleton className="h-12 w-40 rounded-full" />
            </div>
          </div>
        </div>
      </div>

      {/* Features skeleton */}
      <div className="py-12 md:py-20">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <Skeleton className="h-8 w-48 mx-auto mb-10 rounded-xl" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-20 rounded-2xl" />
            ))}
          </div>
        </div>
      </div>

      {/* How it works skeleton */}
      <div className="py-12 md:py-20 bg-white">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <Skeleton className="h-8 w-48 mx-auto mb-10 rounded-xl" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="text-center">
                <Skeleton className="w-20 h-20 rounded-2xl mx-auto mb-4" />
                <Skeleton className="h-6 w-32 mx-auto mb-2 rounded-lg" />
                <Skeleton className="h-4 w-full max-w-xs mx-auto rounded-lg" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ────────────────────────────────────────────
// Main component
// ────────────────────────────────────────────

export default function ProductDetailPage() {
  const { navigate, openWhatsAppPopup, selectedProductId } = useAppStore();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!selectedProductId) {
      navigate('home');
      return;
    }

    async function loadProduct() {
      try {
        const res = await fetch(`/api/products/${selectedProductId}`);
        if (res.ok) {
          const data = await res.json();
          setProduct(data.data || null);
        }
      } catch {
        // silent
      } finally {
        setLoading(false);
      }
    }
    loadProduct();
  }, [selectedProductId, navigate]);

  const sections = useMemo(() => {
    if (!product) return [];
    const parsed = parseLandingSections(product.landingSections);
    return parsed.length > 0 ? parsed : buildDefaultSections(product);
  }, [product]);

  // ── Loading ──
  if (loading) {
    return <LoadingSkeleton />;
  }

  // ── Not found ──
  if (!product) {
    return (
      <div className="min-h-screen bg-carely-mint flex items-center justify-center px-4">
        <div className="text-center">
          <div className="w-24 h-24 mx-auto mb-6 rounded-3xl bg-white shadow-lg flex items-center justify-center">
            <span className="text-5xl">😕</span>
          </div>
          <p className="text-carely-gray text-lg mb-6 font-semibold">المنتج غير موجود</p>
          <Button
            className="carely-btn-primary"
            onClick={() => navigate('home')}
          >
            <ArrowLeft className="size-4 ml-1.5" />
            العودة للرئيسية
          </Button>
        </div>
      </div>
    );
  }

  // ── Render sections ──
  return (
    <div className="min-h-screen bg-carely-mint">
      <Navbar />
      {sections.map((section, idx) => {
        switch (section.type) {
          case 'hero':
            return (
              <SectionHero
                key={`s-${idx}`}
                data={section as HeroSection}
                product={product}
              />
            );
          case 'features':
            return (
              <SectionFeatures
                key={`s-${idx}`}
                data={section as FeaturesSection}
              />
            );
          case 'how-it-works':
            return (
              <SectionHowItWorks
                key={`s-${idx}`}
                data={section as HowItWorksSection}
              />
            );
          case 'trust-badges':
            return (
              <SectionTrustBadges
                key={`s-${idx}`}
                data={section as TrustBadgesSection}
              />
            );
          case 'pricing':
            return (
              <SectionPricing
                key={`s-${idx}`}
                data={section as PricingSection}
              />
            );
          case 'cta':
            return (
              <SectionCTA
                key={`s-${idx}`}
                data={section as CTASection}
                product={product}
              />
            );
          default:
            return null;
        }
      })}

      <Footer />

      {/* WhatsApp floating button */}
      <WhatsAppFAB />
    </div>
  );
}
