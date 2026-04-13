import { create } from "zustand";

export type PageRoute =
  // Public pages
  | "home"
  | "pricing"
  | "features"
  | "faq"
  | "contact"
  | "privacy-policy"
  | "terms-of-service"
  // Auth
  | "login"
  // Client portal
  | "dashboard"
  | "dashboard-subscription"
  | "dashboard-orders"
  | "dashboard-profile"
  // App pages
  | "qustodio-app"
  // Checkout
  | "checkout"
  | "checkout-success"
  // Admin portal
  | "admin"
  | "admin-users"
  | "admin-user-detail"
  | "admin-subscriptions"
  | "admin-subscription-detail"
  | "admin-orders"
  | "admin-licenses"
  | "admin-license-new"
  // SuperAdmin portal
  | "superadmin-login"
  | "superadmin"
  | "superadmin-users"
  | "superadmin-orders"
  | "superadmin-licenses"
  | "superadmin-whatsapp"
  | "superadmin-settings";

interface AppState {
  currentPage: PageRoute;
  selectedPlan: "silver" | "gold" | null;
  selectedPaymentMethod: "flouci" | "virement" | "ccp" | null;
  selectedPlanName: string;
  selectedUserId: string | null;
  selectedSubscriptionId: string | null;
  whatsappPopupOpen: boolean;
  whatsappPopupMessage: string | undefined;
  navigate: (page: PageRoute) => void;
  setSelectedPlan: (plan: "silver" | "gold" | null) => void;
  setSelectedPaymentMethod: (method: "flouci" | "virement" | "ccp" | null) => void;
  setSelectedPlanName: (name: string) => void;
  setSelectedUserId: (id: string | null) => void;
  setSelectedSubscriptionId: (id: string | null) => void;
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
  whatsappPopupOpen: false,
  whatsappPopupMessage: undefined,
  navigate: (page) => {
    set({ currentPage: page });
    window.scrollTo({ top: 0, behavior: "smooth" });
  },
  setSelectedPlan: (plan) => set({ selectedPlan: plan }),
  setSelectedPaymentMethod: (method) => set({ selectedPaymentMethod: method }),
  setSelectedPlanName: (name) => set({ selectedPlanName: name }),
  setSelectedUserId: (id) => set({ selectedUserId: id }),
  setSelectedSubscriptionId: (id) => set({ selectedSubscriptionId: id }),
  openWhatsAppPopup: (message) => set({ whatsappPopupOpen: true, whatsappPopupMessage: message }),
  closeWhatsAppPopup: () => set({ whatsappPopupOpen: false, whatsappPopupMessage: undefined }),
}));

export interface AuthUser {
  id: string;
  name: string;
  email: string | null;
  phone: string;
  address: string | null;
  wilaya: string | null;
  role: "customer" | "admin";
}

interface AuthState {
  user: AuthUser | null;
  isLoading: boolean;
  lastError: string | null;
  setUser: (user: AuthUser | null) => void;
  setLoading: (loading: boolean) => void;
  /** 
   * OTP login: sends phone + Firebase idToken to server.
   * The server verifies the idToken cryptographically and finds/creates the user.
   * 
   * Note: sendOtp is no longer in the store — it's a direct Firebase client call
   * done in the LoginPage component using lib/firebase-otp.ts functions.
   */
  otpLogin: (phone: string, idToken: string) => Promise<boolean>;
  logout: () => void;
  updateProfile: (data: {
    name?: string;
    phone?: string;
    address?: string;
    wilaya?: string;
  }) => Promise<boolean>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isLoading: false,
  lastError: null,

  setUser: (user) => set({ user, isLoading: false, lastError: null }),
  setLoading: (isLoading) => set({ isLoading }),

  otpLogin: async (phone: string, idToken: string) => {
    try {
      const res = await fetch("/api/auth/otp-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, idToken, action: "login" }),
      });
      const data = await res.json();

      if (!res.ok) {
        set({ lastError: data.error || "حصل مشكل في تسجيل الدخول" });
        return false;
      }

      if (data.success) {
        set({ user: data.user, isLoading: false, lastError: null });
        return true;
      }

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
    try {
      const res = await fetch("/api/auth/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) return false;
      const userData = await res.json();
      set({ user: { ...get().user!, ...userData } });
      return true;
    } catch {
      return false;
    }
  },
}));
