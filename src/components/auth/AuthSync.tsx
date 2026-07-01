"use client";

import { useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { useAuthStore } from "@/store";
import { authUserFromResponseJson } from "@/lib/auth-user";

/** Keeps D1-backed AuthUser in Zustand in sync with the Clerk session. */
export function AuthSync() {
  const { isSignedIn, isLoaded } = useAuth();
  const setUser = useAuthStore((s) => s.setUser);
  const setLoading = useAuthStore((s) => s.setLoading);

  useEffect(() => {
    if (!isLoaded) return;

    if (!isSignedIn) {
      setUser(null);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);

    (async () => {
      try {
        const res = await fetch("/api/auth/clerk-sync", { method: "POST" });
        const data = await res.json();
        if (cancelled) return;
        if (res.ok && data.success && data.user) {
          const u = authUserFromResponseJson(data.user);
          setUser(u);
        } else {
          setUser(null);
        }
      } catch {
        if (!cancelled) setUser(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [isSignedIn, isLoaded, setUser, setLoading]);

  return null;
}
