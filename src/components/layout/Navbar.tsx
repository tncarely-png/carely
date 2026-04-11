'use client'

import { useState, useEffect } from 'react'
import { useAppStore, useAuthStore } from '@/store'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetHeader } from '@/components/ui/sheet'
import { Menu, Home, Wallet, User, MessageCircle, LogOut, X } from 'lucide-react'

const NAV_LINKS = [
  { label: 'الرئيسية', page: 'home' as const, icon: Home },
  { label: 'الأسعار', page: 'pricing' as const, icon: Wallet },
  { label: 'المميزات', page: 'features' as const, icon: User },
  { label: 'تواصل معانا', page: 'contact' as const, icon: MessageCircle },
]

export default function Navbar() {
  const { navigate, currentPage } = useAppStore()
  const { user, logout } = useAuthStore()
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <>
      {/* Desktop & Mobile Top Navbar */}
      <header
        className={`sticky top-0 z-40 bg-white transition-shadow duration-200 ${
          scrolled ? 'shadow-md' : ''
        } border-b-2 border-carely-green`}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Left: Nav Links (RTL - start side) */}
            <nav className="hidden md:flex items-center gap-6">
              {NAV_LINKS.map((link) => (
                <button
                  key={link.page}
                  onClick={() => navigate(link.page)}
                  className={`text-sm font-bold transition-colors hover:text-carely-green ${
                    currentPage === link.page
                      ? 'text-carely-green'
                      : 'text-carely-gray'
                  }`}
                >
                  {link.label}
                </button>
              ))}
            </nav>

            {/* Left: Mobile hamburger (RTL - start side) */}
            <div className="md:hidden">
              <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="text-carely-gray">
                    <Menu className="size-6" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="p-0 w-72">
                  <SheetHeader className="p-4 border-b border-carely-light bg-carely-mint">
                    <SheetTitle className="text-carely-green text-lg flex items-center gap-2">
                      🛡️ Carely.tn
                    </SheetTitle>
                  </SheetHeader>
                  <nav className="flex flex-col p-4 gap-1">
                    {NAV_LINKS.map((link) => {
                      const Icon = link.icon
                      return (
                        <button
                          key={link.page}
                          onClick={() => {
                            navigate(link.page)
                            setMobileOpen(false)
                          }}
                          className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-colors ${
                            currentPage === link.page
                              ? 'bg-carely-light text-carely-green'
                              : 'text-carely-gray hover:bg-carely-mint hover:text-carely-green'
                          }`}
                        >
                          <Icon className="size-5" />
                          {link.label}
                        </button>
                      )
                    })}
                  </nav>
                  <div className="mt-auto p-4 border-t border-carely-light flex flex-col gap-2">
                    {user ? (
                      <div className="flex flex-col gap-2">
                        <p className="text-sm text-carely-gray px-4">
                          مرحبا، <span className="font-bold text-carely-dark">{user.name}</span>
                        </p>
                        <Button
                          variant="ghost"
                          className="text-red-500 hover:text-red-600 hover:bg-red-50 justify-start px-4"
                          onClick={() => {
                            logout()
                            setMobileOpen(false)
                          }}
                        >
                          <LogOut className="size-4 ml-2" />
                          خروج
                        </Button>
                      </div>
                    ) : (
                      <Button
                        variant="outline"
                        className="border-carely-green text-carely-green hover:bg-carely-green hover:text-white w-full"
                        onClick={() => {
                          navigate('login')
                          setMobileOpen(false)
                        }}
                      >
                        سجل دخول
                      </Button>
                    )}
                  </div>
                </SheetContent>
              </Sheet>
            </div>

            {/* Right: Logo (RTL - end side) */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                {user ? (
                  <div className="hidden sm:flex items-center gap-3">
                    <span className="text-sm text-carely-gray">
                      مرحبا، <span className="font-bold text-carely-dark">{user.name}</span>
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-500 hover:text-red-600 hover:bg-red-50"
                      onClick={logout}
                    >
                      <LogOut className="size-4 ml-1" />
                      خروج
                    </Button>
                  </div>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-carely-green text-carely-green hover:bg-carely-green hover:text-white rounded-full"
                    onClick={() => navigate('login')}
                  >
                    سجل دخول
                  </Button>
                )}
                <Button
                  size="sm"
                  className="carely-btn-primary text-sm"
                  onClick={() => navigate('pricing')}
                >
                  اشتري الآن
                </Button>
              </div>

              <button
                onClick={() => navigate('home')}
                className="flex items-center gap-0"
              >
                <span className="text-2xl font-extrabold text-carely-green">Carely</span>
                <span className="text-2xl font-bold text-carely-gray">.tn</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t-2 border-carely-green safe-area-inset-bottom">
        <div className="flex items-center justify-around h-16 px-2">
          {NAV_LINKS.map((link) => {
            const Icon = link.icon
            return (
              <button
                key={link.page}
                onClick={() => navigate(link.page)}
                className={`flex flex-col items-center justify-center gap-0.5 px-3 py-1 rounded-xl transition-colors ${
                  currentPage === link.page
                    ? 'text-carely-green'
                    : 'text-gray-400'
                }`}
              >
                <Icon className="size-5" />
                <span className="text-[10px] font-bold leading-tight">{link.label}</span>
              </button>
            )
          })}
        </div>
      </nav>
    </>
  )
}
