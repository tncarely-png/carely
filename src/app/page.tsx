'use client'

import { useAppStore, useAuthStore } from '@/store'

// Layout
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import WhatsAppFAB from '@/components/layout/WhatsAppFAB'
import { WhatsAppAgentPopup } from '@/components/shared/WhatsAppAgentPopup'

// Home sections
import {
  HeroSection,
  AppCardsGrid,
  StatsBar,
  HowItWorks,
  FeaturesGrid,
  ProductCards,
  Testimonials,
  FaqAccordion,
  FinalCTA,
  QustodioAppPage,
  ProductDetailPage,
} from '@/components/home'

// Auth
import { LoginPage } from '@/components/auth'

// Dashboard
import {
  DashboardPage,
  DashboardSidebar,
  SubscriptionPage,
  OrdersPage,
  ProfilePage,
  CheckoutPage,
  CheckoutSuccessPage,
} from '@/components/dashboard'

// Admin
import {
  AdminLayout,
  AdminDashboard,
  AdminUsers,
  AdminUserDetail,
  AdminSubscriptions,
  AdminSubscriptionDetail,
  AdminOrders,
  AdminLicenses,
  AdminLicenseNew,
} from '@/components/admin'

// SuperAdmin
import {
  SuperAdminLoginPage,
  SuperAdminPinGate,
  SuperAdminLayout,
  SuperAdminDashboard,
  SuperAdminUsers,
  SuperAdminOrders,
  SuperAdminLicenses,
  SuperAdminWhatsApp,
  SuperAdminSettings,
  SuperAdminProducts,
  SuperAdminLandingPage,
} from '@/components/superadmin'

// Legal
import PrivacyPolicyPage from '@/components/legal/PrivacyPolicyPage'
import TermsOfServicePage from '@/components/legal/TermsOfServicePage'

// Contact Page
import ContactPage from '@/components/layout/ContactPage'

function HomePage() {
  return (
    <>
      <HeroSection />
      <AppCardsGrid />
      <StatsBar />
      <HowItWorks />
      <ProductCards />
      <FeaturesGrid />
      <Testimonials />
      <FaqAccordion />
      <FinalCTA />
    </>
  )
}

function PricingPage() {
  return (
    <div className="py-16 md:py-24">
      <ProductCards />
    </div>
  )
}

function FeaturesPage() {
  return <FeaturesGrid />
}

function ContactView() {
  return <ContactPage />
}

function AppRouter() {
  const { currentPage } = useAppStore()
  const user = useAuthStore((s) => s.user)

  // ── SuperAdmin routes ──
  if (currentPage === 'superadmin-pin-gate') {
    return <SuperAdminPinGate />
  }
  if (currentPage === 'superadmin-login') {
    return <SuperAdminLoginPage />
  }
  if (currentPage.startsWith('superadmin')) {
    const renderPage = () => {
      switch (currentPage) {
        case 'superadmin': return <SuperAdminDashboard />
        case 'superadmin-users': return <SuperAdminUsers />
        case 'superadmin-orders': return <SuperAdminOrders />
        case 'superadmin-licenses': return <SuperAdminLicenses />
        case 'superadmin-whatsapp': return <SuperAdminWhatsApp />
        case 'superadmin-settings': return <SuperAdminSettings />
        case 'superadmin-products': return <SuperAdminProducts />
        case 'superadmin-landing': return <SuperAdminLandingPage />
        default: return <SuperAdminDashboard />
      }
    }
    return (
      <SuperAdminLayout>
        {renderPage()}
      </SuperAdminLayout>
    )
  }

  // ── Admin routes ──
  if (currentPage.startsWith('admin')) {
    const renderPage = () => {
      switch (currentPage) {
        case 'admin': return <AdminDashboard />
        case 'admin-users': return <AdminUsers />
        case 'admin-user-detail': return <AdminUserDetail />
        case 'admin-subscriptions': return <AdminSubscriptions />
        case 'admin-subscription-detail': return <AdminSubscriptionDetail />
        case 'admin-orders': return <AdminOrders />
        case 'admin-licenses': return <AdminLicenses />
        case 'admin-license-new': return <AdminLicenseNew />
        default: return <AdminDashboard />
      }
    }
    return (
      <AdminLayout>
        {renderPage()}
      </AdminLayout>
    )
  }

  // ── Login ──
  if (currentPage === 'login') {
    return <LoginPage />
  }

  // ── Legal pages (have their own layout) ──
  if (currentPage === 'privacy-policy') {
    return <PrivacyPolicyPage />
  }
  if (currentPage === 'terms-of-service') {
    return <TermsOfServicePage />
  }

  // ── Public pages ──
  const publicRoutes: Record<string, JSX.Element> = {
    home: <HomePage />,
    pricing: <PricingPage />,
    features: <FeaturesPage />,
    faq: <FaqAccordion />,
    contact: <ContactView />,
    'qustodio-app': <QustodioAppPage />,
    'product-detail': <ProductDetailPage />,
  }
  if (publicRoutes[currentPage]) {
    return publicRoutes[currentPage]
  }

  // ── Dashboard routes ──
  if (currentPage.startsWith('dashboard') || currentPage === 'checkout' || currentPage === 'checkout-success') {
    if (!user) {
      return <LoginPage />
    }

    const renderDashboardPage = () => {
      switch (currentPage) {
        case 'dashboard': return <DashboardPage />
        case 'dashboard-subscription': return <SubscriptionPage />
        case 'dashboard-orders': return <OrdersPage />
        case 'dashboard-profile': return <ProfilePage />
        case 'checkout': return <CheckoutPage />
        case 'checkout-success': return <CheckoutSuccessPage />
        default: return <DashboardPage />
      }
    }

    return (
      <div className="flex min-h-screen">
        <DashboardSidebar />
        <main className="flex-1 overflow-y-auto">
          {renderDashboardPage()}
        </main>
      </div>
    )
  }

  // Fallback
  return <HomePage />
}

export default function RootPage() {
  const {
    whatsappPopupOpen,
    whatsappPopupMessage,
    closeWhatsAppPopup,
  } = useAppStore()

  const { currentPage } = useAppStore()

  // Determine if we need the main layout (Navbar + Footer)
  const needsLayout = !currentPage.startsWith('superadmin') &&
    !currentPage.startsWith('admin') &&
    currentPage !== 'login' &&
    !currentPage.startsWith('dashboard') &&
    currentPage !== 'checkout' &&
    currentPage !== 'checkout-success' &&
    currentPage !== 'privacy-policy' &&
    currentPage !== 'terms-of-service'

  return (
    <div className="min-h-screen flex flex-col">
      {needsLayout && <Navbar />}

      <main className="flex-1">
        <AppRouter />
      </main>

      {needsLayout && <Footer />}
      {needsLayout && <WhatsAppFAB />}

      <WhatsAppAgentPopup
        open={whatsappPopupOpen}
        onClose={closeWhatsAppPopup}
        message={whatsappPopupMessage}
      />
    </div>
  )
}
