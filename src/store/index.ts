import { create } from "zustand";

export type PageRoute =
  // Public pages
  | "home"
  | "pricing"
  | "features"
  | "faq"
  | "contact"
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
  setUser: (user: AuthUser | null) => void;
  setLoading: (loading: boolean) => void;
  /** OTP-based login: verify OTP first, then call this with phone */
  otpLogin: (phone: string) => Promise<boolean>;
  /** OTP-based register: verify OTP first, then call this with user data */
  otpRegister: (data: {
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

  setUser: (user) => set({ user, isLoading: false }),
  setLoading: (isLoading) => set({ isLoading }),

  otpLogin: async (phone: string) => {
    try {
      const res = await fetch("/api/auth/otp-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });
      if (!res.ok) return false;
      const data = await res.json();
      set({ user: data.user, isLoading: false });
      return true;
    } catch {
      return false;
    }
  },

  otpRegister: async (data) => {
    try {
      const res = await fetch("/api/auth/otp-register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) return false;
      const resData = await res.json();
      set({ user: resData.user, isLoading: false });
      return true;
    } catch {
      return false;
    }
  },

  logout: () => {
    set({ user: null, isLoading: false });
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
