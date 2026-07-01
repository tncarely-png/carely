'use client'

import { useState, useEffect } from 'react'
import { useAppStore, useAuthStore } from '@/store'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetHeader } from '@/components/ui/sheet'
import { Menu, Home, User, HelpCircle } from 'lucide-react'
import { ClerkAuthButtons } from '@/components/auth/ClerkAuthButtons'
import { Show } from '@clerk/nextjs'
import UserAvatar from '@/components/shared/UserAvatar'

const NAV_LINKS = [
  { label: 'الرئيسية', page: 'home' as const, icon: Home },
  { label: 'المميزات', page: 'features' as const, icon: User },
  { label: 'الأسئلة الشائعة', page: 'faq' as const, icon: HelpCircle },
]

export default function Navbar() {
  const { navigate, currentPage, setPendingRedirect } = useAppStore()
  const user = useAuthStore((s) => s.user)
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <>
      <header
        className={`sticky top-0 z-40 bg-white transition-shadow duration-200 ${
          scrolled ? 'shadow-md' : ''
        } border-b-2 border-carely-green`}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 overflow-hidden">
          <div className="flex h-16 items-center justify-between gap-2">
            <nav className="hidden md:flex items-center gap-6">
              {NAV_LINKS.map((link) => (
                <button
                  type="button"
                  key={link.page}
                  onClick={() => navigate(link.page)}
                  className={`cursor-pointer text-sm font-bold transition-colors hover:text-carely-green ${
                    currentPage === link.page
                      ? 'text-carely-green'
                      : 'text-carely-gray'
                  }`}
                >
                  {link.label}
                </button>
              ))}
            </nav>

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
                    <Show when="signed-in">
                      {user && (
                        <button
                          type="button"
                          onClick={() => {
                            navigate('dashboard-profile')
                            setMobileOpen(false)
                          }}
                          className="flex items-center gap-3 px-4 py-2 rounded-xl hover:bg-carely-mint"
                        >
                          <UserAvatar user={user} size={40} />
                          <div className="text-right min-w-0">
                            <p className="text-sm font-bold text-carely-dark truncate">{user.name}</p>
                            <p className="text-xs text-carely-gray">حسابي</p>
                          </div>
                        </button>
                      )}
                    </Show>
                    <ClerkAuthButtons variant="mobile" onNavigate={() => setMobileOpen(false)} />
                  </div>
                </SheetContent>
              </Sheet>
            </div>

            <div className="flex items-center gap-2 sm:gap-4 shrink-0">
              <div className="flex items-center gap-1.5 sm:gap-3">
                <div className="hidden sm:flex items-center gap-2">
                  <ClerkAuthButtons />
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="carely-btn-primary text-sm h-9"
                  onClick={() => {
                    if (!user) {
                      setPendingRedirect('checkout')
                      navigate('login')
                    } else {
                      navigate('checkout')
                    }
                  }}
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

      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t-2 border-carely-green safe-area-bottom">
        <div className="flex items-center justify-around h-14 px-2">
          {NAV_LINKS.map((link) => {
            const Icon = link.icon
            return (
              <button
                type="button"
                key={link.page}
                onClick={() => navigate(link.page)}
                className={`touch-target cursor-pointer flex flex-col items-center justify-center gap-0.5 min-w-[4.5rem] px-2 py-1 rounded-xl transition-colors ${
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
