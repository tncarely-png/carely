'use client'

import { useState, useEffect } from 'react'
import { useAppStore } from '@/store'
import { Button } from '@/components/ui/button'
import { ChevronLeft } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'

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

// Fallback static data when API fails
const FALLBACK_APPS = [
  {
    emoji: '🛡️',
    name: 'Qustodio',
    nameAr: 'Qustodio',
    description: 'حماية أطفالك على النت',
    price: 89,
    currency: 'TND',
    priceLabel: 'من 89 دت / سنة',
    isActive: true,
    route: 'qustodio-app',
    imageUrl: null,
  },
]

export default function AppCardsGrid() {
  const { navigate, setSelectedProductId } = useAppStore()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadProducts() {
      try {
        const res = await fetch('/api/products')
        if (res.ok) {
          const data = await res.json()
          setProducts(data.data || [])
        } else {
          setProducts(FALLBACK_APPS as Product[])
        }
      } catch {
        setProducts(FALLBACK_APPS as Product[])
      } finally {
        setLoading(false)
      }
    }
    loadProducts()
  }, [])

  return (
    <section id="app-cards-section" className="py-16 md:py-20">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        {/* Title */}
        <div className="text-center mb-10">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-carely-dark mb-3">
            تطبيقاتنا الحالية
          </h2>
          <p className="text-carely-gray text-base sm:text-lg">
            اختار التطبيق المناسب لعيلتك
          </p>
        </div>

        {/* Loading Skeletons */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 lg:gap-8">
            {[1, 2].map((i) => (
              <div key={i} className="carely-card p-6 space-y-4">
                <Skeleton className="h-14 w-14 rounded-2xl" />
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-8 w-24" />
                <div className="flex-1" />
                <Skeleton className="h-11 w-full rounded-full" />
              </div>
            ))}
          </div>
        ) : (
          /* Cards Grid */
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 lg:gap-8">
            {products.map((product) => {
              const isComingSoon = !product.route || product.slug === 'coming-soon'
              return (
                <div
                  key={product.id}
                  className={`carely-card p-6 flex flex-col transition-all duration-200 hover:shadow-lg hover:-translate-y-1 ${
                    isComingSoon ? 'opacity-60 grayscale' : ''
                  }`}
                >
                  {/* Header */}
                  <div className="flex items-center gap-3 mb-4">
                    {product.imageUrl ? (
                      <div className="shrink-0 w-14 h-14 rounded-2xl bg-carely-mint flex items-center justify-center overflow-hidden">
                        <img
                          src={product.imageUrl}
                          alt={product.nameAr}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="shrink-0 w-14 h-14 rounded-2xl bg-carely-mint flex items-center justify-center text-3xl">
                        {product.emoji || '📦'}
                      </div>
                    )}
                    <div>
                      <h3 className="text-xl font-extrabold text-carely-dark">
                        {product.nameAr}
                      </h3>
                      <p className="text-sm text-carely-gray">
                        {product.descriptionAr || product.description}
                      </p>
                    </div>
                  </div>

                  {/* Price */}
                  {product.price > 0 && (
                    <div className="mb-5">
                      {product.priceLabel ? (
                        <span className="text-2xl font-extrabold text-carely-green">
                          {product.priceLabel}
                        </span>
                      ) : (
                        <span className="text-2xl font-extrabold text-carely-green">
                          {product.price.toFixed(2)} {product.currency || 'دت'}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Spacer */}
                  <div className="flex-1" />

                  {/* CTA */}
                  {!isComingSoon ? (
                    <Button
                      className="w-full carely-btn-primary font-bold py-3 rounded-full"
                      onClick={() => {
                        if (product.externalUrl) {
                          window.open(product.externalUrl, '_blank')
                        } else if (product.route) {
                          // If product has a known SPA route, use it
                          setSelectedProductId(product.id)
                          navigate(product.route as any)
                        } else {
                          // Always navigate to product detail page
                          setSelectedProductId(product.id)
                          navigate('product-detail')
                        }
                      }}
                    >
                      <span>اكتشف</span>
                      <ChevronLeft className="size-4 mr-1" />
                    </Button>
                  ) : (
                    <Button
                      className="w-full bg-gray-200 text-gray-500 font-bold py-3 rounded-full cursor-not-allowed"
                      disabled
                    >
                      قريبًا
                    </Button>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </section>
  )
}
