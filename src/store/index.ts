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
  | "register"
  // Client portal
  | "dashboard"
  | "dashboard-subscription"
  | "dashboard-orders"
  | "dashboard-profile"
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
  | "admin-license-new";

interface AppState {
  currentPage: PageRoute;
  selectedPlan: "silver" | "gold" | null;
  selectedUserId: string | null;
  selectedSubscriptionId: string | null;
  navigate: (page: PageRoute) => void;
  setSelectedPlan: (plan: "silver" | "gold" | null) => void;
  setSelectedUserId: (id: string | null) => void;
  setSelectedSubscriptionId: (id: string | null) => void;
}

export const useAppStore = create<AppState>((set) => ({
  currentPage: "home",
  selectedPlan: null,
  selectedUserId: null,
  selectedSubscriptionId: null,
  navigate: (page) => {
    set({ currentPage: page });
    window.scrollTo({ top: 0, behavior: "smooth" });
  },
  setSelectedPlan: (plan) => set({ selectedPlan: plan }),
  setSelectedUserId: (id) => set({ selectedUserId: id }),
  setSelectedSubscriptionId: (id) => set({ selectedSubscriptionId: id }),
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
  /** Firebase login: send ID token after phone verification */
  firebaseLogin: (idToken: string) => Promise<boolean>;
  /** Firebase register: send ID token + user info after phone verification */
  firebaseRegister: (data: {
    idToken: string;
    name: string;
    phone: string;
    address?: string;
    wilaya?: string;
  }) => Promise<boolean>;
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

  firebaseLogin: async (idToken: string) => {
    try {
      const res = await fetch("/api/auth/firebase-verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken, action: "login" }),
      });
      const data = await res.json();

      if (!res.ok) {
        set({ lastError: data.error || "حصل مشكل في تسجيل الدخول" });
        return false;
      }

      set({ user: data.user, isLoading: false, lastError: null });
      return true;
    } catch {
      set({ lastError: "ما نقدرش نتواصل مع المخدم" });
      return false;
    }
  },

  firebaseRegister: async (data) => {
    try {
      const res = await fetch("/api/auth/firebase-verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, action: "register" }),
      });
      const resData = await res.json();

      if (!res.ok) {
        set({ lastError: resData.error || "حصل مشكل في التسجيل" });
        return false;
      }

      set({ user: resData.user, isLoading: false, lastError: null });
      return true;
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
