'use client'

import { SignIn } from '@clerk/nextjs'
import { useAppStore } from '@/store'

export default function LoginPage() {
  const pendingRedirect = useAppStore((s) => s.pendingRedirect)
  const afterUrl =
    pendingRedirect === 'checkout'
      ? '/checkout'
      : pendingRedirect
        ? `/${pendingRedirect}`
        : '/dashboard'

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4 py-12 bg-gradient-to-b from-carely-mint/50 to-carely-light/30">
      <SignIn
        routing="hash"
        signUpUrl="/sign-up"
        fallbackRedirectUrl={afterUrl}
        forceRedirectUrl={afterUrl}
      />
    </div>
  )
}
