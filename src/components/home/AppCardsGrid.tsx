'use client'

import { useState, useEffect } from 'react'
import { useAppStore } from '@/store'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ShieldCheck } from 'lucide-react'
import { resolveProductImageUrl } from '@/lib/product-images'
import { QSTUDIO_STORE_CARD } from '@/lib/store-content'
import { Skeleton } from '@/components/ui/skeleton'

interface Product {
  id: string
  name: string
  nameAr: string
  slug: string
  description: string | null
  descriptionAr: string | null
  emoji: string | null
  imageUrl: string | null
  price: number
  currency: string | null
  priceLabel: string | null
  features: string[]
  isActive: boolean
  sortOrder: number
  route: string | null
  externalUrl: string | null
}

const FALLBACK_QSTUDIO_CARD_ID = 'fallback-qstudio-static'

function qstudioCardFromCode(): Product {
  return {
    id: FALLBACK_QSTUDIO_CARD_ID,
    slug: QSTUDIO_STORE_CARD.slug,
    name: QSTUDIO_STORE_CARD.name,
    nameAr: QSTUDIO_STORE_CARD.nameAr,
    description: QSTUDIO_STORE_CARD.description,
    descriptionAr: QSTUDIO_STORE_CARD.descriptionAr,
    price: QSTUDIO_STORE_CARD.price,
    currency: QSTUDIO_STORE_CARD.currency,
    priceLabel: QSTUDIO_STORE_CARD.priceLabel,
    isActive: true,
    route: QSTUDIO_STORE_CARD.route,
    externalUrl: null,
    emoji: QSTUDIO_STORE_CARD.emoji,
    imageUrl: QSTUDIO_STORE_CARD.imageUrl,
    sortOrder: 0,
    features: [],
  }
}

const FALLBACK_APPS: Product[] = [qstudioCardFromCode()]

function normalizeStoreProducts(rows: Product[]): Product[] {
  const mapped = rows.map((p) => ({
    ...p,
    imageUrl: resolveProductImageUrl(p) ?? p.imageUrl ?? null,
  }))
  const hasQstudio = mapped.some(
    (p) =>
      p.slug === 'qstudio' ||
      p.slug === 'qustodio' ||
      p.route === 'qstudio-app' ||
      p.route === 'qustodio-app'
  )
  if (!hasQstudio) {
    return [qstudioCardFromCode(), ...mapped]
  }
  return mapped.map((p) =>
    p.slug === 'qstudio' || p.slug === 'qustodio' || p.route === 'qstudio-app'
      ? {
          ...p,
          imageUrl: p.imageUrl || QSTUDIO_STORE_CARD.imageUrl,
          route: 'qstudio-app',
        }
      : p
  )
}

export default function AppCardsGrid() {
  const { navigate, openProductDetail } = useAppStore()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadProducts() {
      try {
        const res = await fetch('/api/products')
        if (res.ok) {
          const data = await res.json()
          const rows: Product[] = data.data || []
          setProducts(normalizeStoreProducts(rows))
        } else {
          setProducts(FALLBACK_APPS)
        }
      } catch {
        setProducts(FALLBACK_APPS)
      } finally {
        setLoading(false)
      }
    }
    loadProducts()
  }, [])

  return (
    <section id="app-cards-section" className="py-16 md:py-24">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-carely-dark mb-3">
            تطبيقاتنا
          </h2>
          <p className="text-carely-gray text-base sm:text-lg">
            اختار المنتج اللي يناسب عيلتك — التفاصيل والأسعار في صفحة كل منتج
          </p>
        </div>

        {/* Loading Skeletons */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3].map((i) => (
              <div key={i} className="product-card">
                <Skeleton className="w-full aspect-square rounded-t-2xl" />
                <div className="p-5 space-y-3">
                  <Skeleton className="h-5 w-28" />
                  <Skeleton className="h-3.5 w-full" />
                  <Skeleton className="h-3.5 w-20" />
                  <div className="pt-2">
                    <Skeleton className="h-11 w-full rounded-xl" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Product Cards Grid */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {products.map((product) => {
              const isComingSoon = product.slug === 'coming-soon'
              const goToProduct = () => {
                if (isComingSoon) return
                if (product.externalUrl) {
                  window.open(product.externalUrl, '_blank')
                  return
                }
                if (
                  (product.id === FALLBACK_QSTUDIO_CARD_ID &&
                    product.route === 'qstudio-app') ||
                  product.route === 'qustodio-app'
                ) {
                  navigate('qstudio-app')
                  return
                }
                if (product.id) {
                  openProductDetail(product.id)
                }
              }
              return (
                <div
                  key={product.id}
                  className={`product-card group cursor-pointer ${
                    isComingSoon ? 'opacity-50 grayscale pointer-events-none' : ''
                  }`}
                  onClick={goToProduct}
                >
                  {/* ── Image Area ── */}
                  <div className="relative w-full aspect-square overflow-hidden rounded-t-2xl bg-gradient-to-br from-carely-mint to-carely-light">
                    {product.imageUrl ? (
                      <img
                        src={product.imageUrl}
                        alt={product.nameAr}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-[5.5rem] sm:text-6xl drop-shadow-sm transition-transform duration-500 group-hover:scale-110">
                          {product.emoji || '📦'}
                        </span>
                      </div>
                    )}

                    {/* Subtle overlay on hover */}
                    <div className="absolute inset-0 bg-carely-dark/0 group-hover:bg-carely-dark/5 transition-colors duration-300 rounded-t-2xl" />

                    {/* Badge */}
                    {!isComingSoon && product.price > 0 && (
                      <div className="absolute top-3 left-3">
                        <span className="inline-flex items-center gap-1 bg-white/90 backdrop-blur-sm text-carely-dark text-xs font-bold px-2.5 py-1 rounded-lg shadow-sm">
                          <ShieldCheck className="w-3 h-3 text-carely-green" />
                          مدفوع
                        </span>
                      </div>
                    )}

                    {isComingSoon && (
                      <div className="absolute inset-0 flex items-center justify-center bg-white/60 backdrop-blur-[2px]">
                        <span className="text-carely-dark font-extrabold text-lg bg-white px-5 py-2 rounded-full shadow-md">
                          قريبًا
                        </span>
                      </div>
                    )}
                  </div>

                  {/* ── Info Area ── */}
                  <div className="p-5">
                    {/* Product Name */}
                    <h3 className="text-lg font-extrabold text-carely-dark mb-1 truncate">
                      {product.nameAr}
                    </h3>

                    {/* Description */}
                    <p className="text-sm text-carely-gray mb-4 line-clamp-2 leading-relaxed min-h-[2.5rem]">
                      {product.descriptionAr || product.description}
                    </p>

                    {/* CTA */}
                    {!isComingSoon && (
                      <Button
                        className="w-full bg-carely-dark text-white font-bold py-3 rounded-xl text-sm transition-all duration-200 hover:bg-carely-green hover:shadow-lg hover:shadow-carely-green/20"
                        onClick={(e) => {
                          e.stopPropagation()
                          goToProduct()
                        }}
                      >
                        <span>شوف التفاصيل</span>
                        <ChevronLeft className="size-4 mr-1" />
                      </Button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </section>
  )
}
