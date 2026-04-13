'use client'

import { useState, useEffect } from 'react'
import { useAppStore } from '@/store'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ShieldCheck } from 'lucide-react'
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
    <section id="app-cards-section" className="py-16 md:py-24">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-carely-dark mb-3">
            تطبيقاتنا الحالية
          </h2>
          <p className="text-carely-gray text-base sm:text-lg">
            اختار التطبيق المناسب لعيلتك
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
              return (
                <div
                  key={product.id}
                  className={`product-card group cursor-pointer ${
                    isComingSoon ? 'opacity-50 grayscale pointer-events-none' : ''
                  }`}
                  onClick={() => {
                    if (isComingSoon) return
                    if (product.externalUrl) {
                      window.open(product.externalUrl, '_blank')
                    } else {
                      setSelectedProductId(product.id)
                      navigate('product-detail')
                    }
                  }}
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
                    <p className="text-sm text-carely-gray mb-3 line-clamp-2 leading-relaxed min-h-[2.5rem]">
                      {product.descriptionAr || product.description}
                    </p>

                    {/* Price */}
                    {product.price > 0 && (
                      <div className="mb-4">
                        {product.priceLabel ? (
                          <span className="text-xl font-extrabold text-carely-green">
                            {product.priceLabel}
                          </span>
                        ) : (
                          <div className="flex items-baseline gap-1">
                            <span className="text-xl font-extrabold text-carely-green">
                              {product.price.toFixed(2)}
                            </span>
                            <span className="text-sm text-carely-gray font-medium">
                              {product.currency || 'دت'}
                            </span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* CTA */}
                    {!isComingSoon && (
                      <Button
                        className="w-full bg-carely-dark text-white font-bold py-3 rounded-xl text-sm transition-all duration-200 hover:bg-carely-green hover:shadow-lg hover:shadow-carely-green/20"
                        onClick={(e) => {
                          e.stopPropagation()
                          if (product.externalUrl) {
                            window.open(product.externalUrl, '_blank')
                          } else {
                            setSelectedProductId(product.id)
                            navigate('product-detail')
                          }
                        }}
                      >
                        <span>اكتشف</span>
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
