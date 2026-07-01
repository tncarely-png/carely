"use client";

import { ClerkProvider } from "@clerk/nextjs";
import { shadcn } from "@clerk/ui/themes";
import { AuthSync } from "@/components/auth/AuthSync";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider appearance={{ theme: shadcn }}>
      <AuthSync />
      {children}
    </ClerkProvider>
  );
}
