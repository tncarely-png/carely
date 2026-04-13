'use client';

import { useEffect, useState } from 'react';
import { useAppStore } from '@/store';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Check, ArrowLeft, MessageCircle } from 'lucide-react';
import { getWhatsAppLink } from '@/lib/constants';

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
}

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

  if (loading) {
    return (
      <div className="min-h-screen bg-carely-mint">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-16">
          <Skeleton className="h-8 w-32 mb-8" />
          <div className="carely-card p-8 space-y-6">
            <div className="flex items-center gap-4">
              <Skeleton className="w-20 h-20 rounded-2xl" />
              <div className="space-y-2">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-4 w-32" />
              </div>
            </div>
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-12 w-full rounded-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-carely-mint flex items-center justify-center">
        <div className="text-center">
          <p className="text-5xl mb-4">😕</p>
          <p className="text-carely-gray text-lg mb-4">المنتج غير موجود</p>
          <Button className="carely-btn-primary" onClick={() => navigate('home')}>
            <ArrowLeft className="size-4 ml-1" />
            العودة للرئيسية
          </Button>
        </div>
      </div>
    );
  }

  const waMessage = `مرحبا، أريد الاستفسار عن ${product.nameAr}${product.priceLabel ? ` (${product.priceLabel})` : ''}`;

  return (
    <div className="min-h-screen bg-carely-mint">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8 md:py-16">
        {/* Back button */}
        <div className="mb-8">
          <Button
            variant="ghost"
            className="text-carely-gray hover:text-carely-green font-medium"
            onClick={() => navigate('home')}
          >
            <ArrowLeft className="size-4 ml-1" />
            <span>الرئيسية</span>
          </Button>
        </div>

        {/* Product Hero Card */}
        <div className="carely-card p-6 md:p-8 mb-8">
          <div className="flex flex-col sm:flex-row items-start gap-5 mb-6">
            {/* Image / Emoji */}
            <div className="shrink-0 w-20 h-20 md:w-24 md:h-24 rounded-2xl bg-carely-mint flex items-center justify-center overflow-hidden">
              {product.imageUrl ? (
                <img
                  src={product.imageUrl}
                  alt={product.nameAr}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-5xl md:text-6xl">{product.emoji || '📦'}</span>
              )}
            </div>

            {/* Title + Description */}
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl md:text-3xl font-extrabold text-carely-dark mb-1">
                {product.nameAr}
              </h1>
              <p className="text-base text-carely-gray mb-2" dir="ltr">
                {product.name}
              </p>
              {(product.descriptionAr || product.description) && (
                <p className="text-sm text-carely-gray leading-relaxed">
                  {product.descriptionAr || product.description}
                </p>
              )}
            </div>
          </div>

          {/* Price Section */}
          {product.price > 0 && (
            <div className="mb-6 p-4 rounded-xl" style={{ background: '#f0fdf4' }}>
              <div className="flex items-baseline gap-2">
                {product.priceLabel ? (
                  <span className="text-3xl font-extrabold text-carely-green">
                    {product.priceLabel}
                  </span>
                ) : (
                  <>
                    <span className="text-3xl font-extrabold text-carely-green">
                      {product.price.toFixed(2)}
                    </span>
                    <span className="text-lg text-carely-gray font-medium">
                      {product.currency || 'دت'}
                    </span>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Features */}
          {product.features && product.features.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-bold text-carely-dark mb-3">المميزات</h3>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {product.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm">
                    <Check className="size-4 text-carely-green shrink-0 mt-0.5" />
                    <span className="text-carely-gray">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              className="carely-btn-primary flex-1 font-bold py-3 rounded-full text-base"
              onClick={() => {
                // If product has a dedicated SPA route (like qustodio-app), go there
                if (product.route) {
                  navigate(product.route as any);
                } else {
                  openWhatsAppPopup(waMessage);
                }
              }}
            >
              {product.route ? (
                <>
                  <span>اكتشف المزيد</span>
                  <ArrowLeft className="size-4 ml-1" />
                </>
              ) : (
                <>
                  <MessageCircle className="size-4 ml-1" />
                  <span>اطلب الآن على واتساب</span>
                </>
              )}
            </Button>

            <a
              href={getWhatsAppLink(waMessage)}
              target="_blank"
              rel="noopener noreferrer"
              className="sm:hidden"
            >
              <Button
                variant="outline"
                className="w-full font-bold py-3 rounded-full text-base border-carely-green text-carely-green hover:bg-carely-green hover:text-white"
              >
                💬 واتساب مباشر
              </Button>
            </a>
          </div>
        </div>

        {/* Trust Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { emoji: '⚡', text: 'تفعيل فوري' },
            { emoji: '🛡️', text: 'ضمان 7 أيام' },
            { emoji: '💬', text: 'دعم بالتونسي' },
            { emoji: '🇹🇳', text: 'من تونس' },
          ].map((badge) => (
            <div key={badge.text} className="carely-card p-4 text-center">
              <span className="text-2xl mb-1 block">{badge.emoji}</span>
              <span className="text-xs font-bold text-carely-gray">{badge.text}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
