import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import {
  type AuthUser,
  authUserFromResponseJson,
} from "@/lib/auth-user";
import type { PaymentMethodId } from "@/lib/constants";

export type { AuthUser };
export type { UserRole } from "@/lib/auth-user";

export type PageRoute =
  | "home"
  | "pricing"
  | "features"
  | "faq"
  | "contact"
  | "privacy-policy"
  | "terms-of-service"
  | "login"
  | "dashboard"
  | "dashboard-subscription"
  | "dashboard-orders"
  | "dashboard-profile"
  | "qstudio-app"
  | "product-detail"
  | "checkout"
  | "checkout-success"
  | "admin"
  | "admin-users"
  | "admin-user-detail"
  | "admin-subscriptions"
  | "admin-subscription-detail"
  | "admin-orders"
  | "admin-licenses"
  | "admin-license-new"
  | "superadmin-pin-gate"
  | "superadmin-login"
  | "superadmin"
  | "superadmin-users"
  | "superadmin-orders"
  | "superadmin-licenses"
  | "superadmin-whatsapp"
  | "superadmin-settings"
  | "superadmin-products"
  | "superadmin-landing";

interface AppState {
  currentPage: PageRoute;
  selectedPlan: "silver" | "gold" | null;
  selectedPaymentMethod: PaymentMethodId | null;
  selectedPlanName: string;
  selectedUserId: string | null;
  selectedSubscriptionId: string | null;
  selectedProductId: string | null;
  whatsappPopupOpen: boolean;
  whatsappPopupMessage: string | undefined;
  pendingRedirect: PageRoute | null;
  navigate: (page: PageRoute) => void;
  /** Sets product id, goes to product-detail, updates URL to /product-detail?id=… */
  openProductDetail: (productId: string) => void;
  setSelectedPlan: (plan: "silver" | "gold" | null) => void;
  setSelectedPaymentMethod: (method: PaymentMethodId | null) => void;
  setSelectedPlanName: (name: string) => void;
  setSelectedUserId: (id: string | null) => void;
  setSelectedSubscriptionId: (id: string | null) => void;
  setSelectedProductId: (id: string | null) => void;
  setPendingRedirect: (page: PageRoute | null) => void;
  openWhatsAppPopup: (message?: string) => void;
  closeWhatsAppPopup: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  currentPage: "home",
  selectedPlan: null,
  selectedPaymentMethod: null,
  selectedPlanName: "",
  selectedUserId: null,
  selectedSubscriptionId: null,
  selectedProductId: null,
  whatsappPopupOpen: false,
  whatsappPopupMessage: undefined,
  pendingRedirect: null,
  navigate: (page) => {
    set((s) => ({
      currentPage: page,
      selectedProductId:
        page === "product-detail" ? s.selectedProductId : null,
    }));
    if (typeof window !== "undefined") {
      const { selectedProductId: pid } = useAppStore.getState();
      if (page === "product-detail" && pid) {
        window.history.pushState(
          {},
          "",
          `/product-detail?id=${encodeURIComponent(pid)}`
        );
      } else if (page === "qstudio-app") {
        window.history.pushState({}, "", "/qstudio-app");
      }
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  },
  openProductDetail: (productId) => {
    set({ selectedProductId: productId, currentPage: "product-detail" });
    if (typeof window !== "undefined") {
      window.history.pushState(
        {},
        "",
        `/product-detail?id=${encodeURIComponent(productId)}`
      );
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  },
  setSelectedPlan: (plan) => set({ selectedPlan: plan }),
  setSelectedPaymentMethod: (method) => set({ selectedPaymentMethod: method }),
  setSelectedPlanName: (name) => set({ selectedPlanName: name }),
  setSelectedUserId: (id) => set({ selectedUserId: id }),
  setSelectedSubscriptionId: (id) => set({ selectedSubscriptionId: id }),
  setSelectedProductId: (id) => set({ selectedProductId: id }),
  setPendingRedirect: (page) => set({ pendingRedirect: page }),
  openWhatsAppPopup: (message) => set({ whatsappPopupOpen: true, whatsappPopupMessage: message }),
  closeWhatsAppPopup: () => set({ whatsappPopupOpen: false, whatsappPopupMessage: undefined }),
}));

interface AuthState {
  user: AuthUser | null;
  isLoading: boolean;
  lastError: string | null;
  setUser: (user: AuthUser | Record<string, unknown> | null) => void;
  setLoading: (loading: boolean) => void;
  otpLogin: (email: string, code: string) => Promise<boolean>;
  /** Re-fetch user from DB (after tab restore / stale cache). Clears user if invalid. */
  refreshUser: () => Promise<void>;
  logout: () => void;
  updateProfile: (data: {
    name?: string;
    phone?: string;
    address?: string;
    wilaya?: string;
  }) => Promise<boolean>;
}

function normalizeSetUserPayload(
  user: AuthUser | Record<string, unknown> | null
): AuthUser | null {
  if (!user) return null;
  return authUserFromResponseJson(user) ?? (user as AuthUser);
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isLoading: false,
      lastError: null,

      setUser: (user) =>
        set({
          user: normalizeSetUserPayload(user),
          isLoading: false,
          lastError: null,
        }),

      setLoading: (isLoading) => set({ isLoading }),

      refreshUser: async () => {
        const id = get().user?.id;
        if (!id) return;
        set({ isLoading: true });
        try {
          const res = await fetch(
            `/api/auth/session?userId=${encodeURIComponent(id)}`
          );
          const data = await res.json();
          if (res.ok && data.success && data.user) {
            const u = authUserFromResponseJson(data.user);
            if (u) {
              set({ user: u, isLoading: false, lastError: null });
              return;
            }
          }
          set({ user: null, isLoading: false, lastError: null });
        } catch {
          set({ user: null, isLoading: false, lastError: null });
        }
      },

      otpLogin: async (email: string, code: string) => {
        try {
          const res = await fetch("/api/auth/otp-login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, code, action: "login" }),
          });
          const data = await res.json();

          if (!res.ok) {
            set({ lastError: data.error || "حصل مشكل في تسجيل الدخول" });
            return false;
          }

          if (data.success && data.user) {
            const u = authUserFromResponseJson(data.user);
            if (u) {
              set({ user: u, isLoading: false, lastError: null });
              return true;
            }
          }

          set({ lastError: data.error || "حصل مشكل في تسجيل الدخول" });
          return false;
        } catch {
          set({ lastError: "ما نقدرش نتواصل مع المخدم" });
          return false;
        }
      },

      logout: () => {
        set({ user: null, isLoading: false, lastError: null });
        useAppStore.getState().navigate("home");
      },

      updateProfile: async (data) => {
        const currentUser = get().user;
        if (!currentUser) return false;
        try {
          const res = await fetch("/api/auth/profile", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId: currentUser.id, ...data }),
          });
          if (!res.ok) return false;
          const payload = await res.json();
          const u = authUserFromResponseJson(payload.user);
          if (!u) return false;
          set({ user: u });
          return true;
        } catch {
          return false;
        }
      },
    }),
    {
      name: "carely-auth-v1",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ user: state.user }),
      onRehydrateStorage: () => (state) => {
        if (state?.user?.id) {
          queueMicrotask(() => {
            void useAuthStore.getState().refreshUser();
          });
        }
      },
    }
  )
);
