'use client'

import { SignInButton, SignUpButton, Show, UserButton, useClerk } from '@clerk/nextjs'
import { useAppStore, useAuthStore } from '@/store'
import { Button } from '@/components/ui/button'
import { LayoutDashboard } from 'lucide-react'

interface ClerkAuthButtonsProps {
  variant?: 'desktop' | 'mobile'
  onNavigate?: () => void
}

export function ClerkAuthButtons({
  variant = 'desktop',
  onNavigate,
}: ClerkAuthButtonsProps) {
  const { signOut } = useClerk()
  const navigate = useAppStore((s) => s.navigate)
  const setUser = useAuthStore((s) => s.setUser)
  const user = useAuthStore((s) => s.user)

  const goDashboard = () => {
    navigate('dashboard')
    onNavigate?.()
  }

  const handleSignOut = async () => {
    await signOut()
    setUser(null)
    navigate('home')
    onNavigate?.()
  }

  if (variant === 'mobile') {
    return (
      <>
        <Show when="signed-out">
          <SignInButton mode="modal">
            <Button variant="ghost" className="carely-btn-outline w-full h-10">
              سجل دخول
            </Button>
          </SignInButton>
          <SignUpButton mode="modal">
            <Button variant="ghost" className="w-full h-10 text-carely-gray">
              حساب جديد
            </Button>
          </SignUpButton>
        </Show>
        <Show when="signed-in">
          <div className="flex flex-col gap-2 w-full">
            <Button
              variant="outline"
              className="border-carely-green text-carely-green justify-start px-4 w-full"
              onClick={goDashboard}
            >
              <LayoutDashboard className="size-4 ml-2" />
              لوحة التحكم
            </Button>
            <div className="flex justify-center py-2">
              <UserButton afterSignOutUrl="/" />
            </div>
            <Button
              variant="ghost"
              className="text-red-500 hover:text-red-600 hover:bg-red-50 justify-start px-4 w-full"
              onClick={handleSignOut}
            >
              خروج
            </Button>
          </div>
        </Show>
      </>
    )
  }

  return (
    <>
      <Show when="signed-out">
        <SignInButton mode="modal">
          <Button
            variant="ghost"
            size="sm"
            className="carely-btn-outline rounded-full hidden sm:inline-flex h-9 px-4 py-2 text-sm w-full sm:w-auto"
          >
            سجل دخول
          </Button>
        </SignInButton>
        <SignUpButton mode="modal">
          <Button
            variant="ghost"
            size="sm"
            className="hidden sm:inline-flex h-9 px-3 text-sm text-carely-gray"
          >
            حساب جديد
          </Button>
        </SignUpButton>
      </Show>
      <Show when="signed-in">
        {user && (
          <Button
            variant="outline"
            size="sm"
            className="border-carely-green text-carely-green hover:bg-carely-mint rounded-full gap-2 hidden sm:inline-flex"
            onClick={goDashboard}
          >
            <LayoutDashboard className="size-4" />
            لوحة التحكم
          </Button>
        )}
        <UserButton afterSignOutUrl="/" />
      </Show>
    </>
  )
}
