'use client';

import { useEffect } from 'react';
import { useAppStore, useAuthStore, type PageRoute } from '@/store';

// Auth
import { LoginPage } from '@/components/auth';

// Dashboard
import {
  DashboardSidebar,
  DashboardPage,
  SubscriptionPage,
  OrdersPage,
  ProfilePage,
  CheckoutPage,
  CheckoutSuccessPage,
} from '@/components/dashboard';

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
} from '@/components/admin';

// SuperAdmin
import {
  SuperAdminLoginPage,
  SuperAdminLayout,
  SuperAdminDashboard,
  SuperAdminUsers,
  SuperAdminOrders,
  SuperAdminLicenses,
  SuperAdminWhatsApp,
  SuperAdminSettings,
} from '@/components/superadmin';

// Homepage
import {
  HeroSection,
  StatsBar,
  AppCardsGrid,
  HowItWorks,
  FeaturesGrid,
  Testimonials,
  FaqAccordion,
  FinalCTA,
  QustodioAppPage,
} from '@/components/home';

// Legal
import PrivacyPolicyPage from '@/components/legal/PrivacyPolicyPage';
import TermsOfServicePage from '@/components/legal/TermsOfServicePage';

// Layout
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import WhatsAppFAB from '@/components/layout/WhatsAppFAB';
import { useWhatsAppAgent } from '@/hooks/useWhatsAppAgent';

// ═══════════════════════════════════════════
// PUBLIC PAGES
// ═══════════════════════════════════════════

function HomePage() {
  return (
    <>
      <Navbar />
      <main className="flex-1">
        <HeroSection />
        <StatsBar />
        <AppCardsGrid />
        <HowItWorks />
        <FeaturesGrid />
        <Testimonials />
        <FaqAccordion />
        <FinalCTA />
      </main>
      <Footer />
      <WhatsAppFAB />
    </>
  );
}

function PricingPage() {
  const { navigate } = useAppStore();
  return (
    <>
      <Navbar />
      <main className="flex-1">
        <section className="py-16 px-4">
          <div className="max-w-5xl mx-auto">
            <h1 className="text-3xl md:text-4xl font-extrabold text-center text-carely-dark mb-4">
              أسعارنا
            </h1>
            <p className="text-center text-carely-gray text-lg mb-12">
              اختار الباقة المناسبة لعيلتك — كل الباقات تشمل سنة كاملة
            </p>
            <AppCardsGrid />
          </div>
        </section>
        <FinalCTA />
      </main>
      <Footer />
      <WhatsAppFAB />
    </>
  );
}

function FeaturesPage() {
  return (
    <>
      <Navbar />
      <main className="flex-1">
        <section className="py-16 px-4">
          <div className="max-w-6xl mx-auto">
            <h1 className="text-3xl md:text-4xl font-extrabold text-center text-carely-dark mb-4">
              مميزات Qustodio
            </h1>
            <p className="text-center text-carely-gray text-lg mb-12">
              كل اللي تحتاجيه تحمي أولادك على النت في مكان واحد
            </p>
            <FeaturesGrid />
          </div>
        </section>
        <HowItWorks />
        <FinalCTA />
      </main>
      <Footer />
      <WhatsAppFAB />
    </>
  );
}

function FaqPage() {
  return (
    <>
      <Navbar />
      <main className="flex-1">
        <section className="py-16 px-4">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-3xl md:text-4xl font-extrabold text-center text-carely-dark mb-4">
              الأسئلة الشايعة
            </h1>
            <p className="text-center text-carely-gray text-lg mb-12">
              كل اللي تحب تعرفه عن Carely.tn و Qustodio
            </p>
            <FaqAccordion />
          </div>
        </section>
        <FinalCTA />
      </main>
      <Footer />
      <WhatsAppFAB />
    </>
  );
}

function ContactPage() {
  const { navigate } = useAppStore();
  const { getLink } = useWhatsAppAgent();
  return (
    <>
      <Navbar />
      <main className="flex-1">
        <section className="py-16 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-3xl md:text-4xl font-extrabold text-carely-dark mb-4">
              تواصل معانا
            </h1>
            <p className="text-carely-gray text-lg mb-12">
              فريقنا جاهز يساعدك في أي وقت — تواصل معانا على واتساب أو بالإيميل
            </p>
            <div className="grid md:grid-cols-2 gap-6 mb-12">
              <div className="carely-card p-8 text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">💬</span>
                </div>
                <h3 className="text-xl font-bold text-carely-dark mb-2">واتساب</h3>
                <p className="text-carely-gray mb-4">أسرع طريقة للتواصل — رد في أقل من ساعة</p>
                <a
                  href={getLink('مرحبا، أريد الاستفسار عن اشتراك Carely.tn')}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="carely-btn-primary inline-block"
                >
                  تواصل على واتساب
                </a>
              </div>
              <div className="carely-card p-8 text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">📧</span>
                </div>
                <h3 className="text-xl font-bold text-carely-dark mb-2">البريد الإلكتروني</h3>
                <p className="text-carely-gray mb-4">اكتب لنا وراح نردك في أقل من 24 ساعة</p>
                <a
                  href="mailto:contact@carely.tn"
                  className="carely-btn-outline inline-block"
                >
                  contact@carely.tn
                </a>
              </div>
            </div>
            {/* Location Card */}
            <div className="carely-card p-8 mb-8 text-center">
              <div className="w-16 h-16 bg-carely-light rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">📍</span>
              </div>
              <h3 className="text-xl font-bold text-carely-dark mb-2">موقعنا</h3>
              <p className="text-carely-gray text-lg mb-1">
                📍 نحنا من ولاية الكاف، تونس
              </p>
              <p className="text-carely-gray">
                نخدمو على كامل تراب الجمهورية التونسية
              </p>
            </div>
            <div className="carely-card p-8">
              <h3 className="text-xl font-bold text-carely-dark mb-4">🛡️ ضمان رضا الزبون</h3>
              <p className="text-carely-gray text-lg">
                نحن في Carely.tn نقدم ضمان استرداد كامل خلال 7 أيام إذا ماكنتش راضي على الخدمة
              </p>
            </div>
          </div>
        </section>
      </main>
      <Footer />
      <WhatsAppFAB />
    </>
  );
}

// ═══════════════════════════════════════════
// DASHBOARD ROUTER
// ═══════════════════════════════════════════

function DashboardRouter() {
  const currentPage = useAppStore((s) => s.currentPage);

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard': return <DashboardPage />;
      case 'dashboard-subscription': return <SubscriptionPage />;
      case 'dashboard-orders': return <OrdersPage />;
      case 'dashboard-profile': return <ProfilePage />;
      default: return <DashboardPage />;
    }
  };

  return (
    <div className="min-h-screen bg-carely-mint overflow-x-hidden">
      <div className="max-w-7xl mx-auto p-4 md:p-6">
        <div className="md:hidden h-14" />
        <div className="flex gap-6">
          <DashboardSidebar />
          <main className="flex-1 min-w-0">
            {renderPage()}
          </main>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════
// ADMIN ROUTER
// ═══════════════════════════════════════════

function AdminRouter() {
  const currentPage = useAppStore((s) => s.currentPage);

  const renderPage = () => {
    switch (currentPage) {
      case 'admin': return <AdminDashboard />;
      case 'admin-users': return <AdminUsers />;
      case 'admin-user-detail': return <AdminUserDetail />;
      case 'admin-subscriptions': return <AdminSubscriptions />;
      case 'admin-subscription-detail': return <AdminSubscriptionDetail />;
      case 'admin-orders': return <AdminOrders />;
      case 'admin-licenses': return <AdminLicenses />;
      case 'admin-license-new': return <AdminLicenseNew />;
      default: return <AdminDashboard />;
    }
  };

  return (
    <AdminLayout>
      {renderPage()}
    </AdminLayout>
  );
}

// ═══════════════════════════════════════════
// SUPERADMIN ROUTER
// ═══════════════════════════════════════════

function SuperAdminRouter() {
  const currentPage = useAppStore((s) => s.currentPage);

  const renderPage = () => {
    switch (currentPage) {
      case 'superadmin': return <SuperAdminDashboard />;
      case 'superadmin-users': return <SuperAdminUsers />;
      case 'superadmin-orders': return <SuperAdminOrders />;
      case 'superadmin-licenses': return <SuperAdminLicenses />;
      case 'superadmin-whatsapp': return <SuperAdminWhatsApp />;
      case 'superadmin-settings': return <SuperAdminSettings />;
      default: return <SuperAdminDashboard />;
    }
  };

  return (
    <SuperAdminLayout>
      {renderPage()}
    </SuperAdminLayout>
  );
}

// ═══════════════════════════════════════════
// MAIN PAGE ROUTER
// ═══════════════════════════════════════════

export default function Home() {
  const currentPage = useAppStore((s) => s.currentPage);

  // Seed on first load
  useEffect(() => {
    fetch('/api/seed').catch(() => {});
  }, []);

  // SuperAdmin login (full screen, no layout)
  if (currentPage === 'superadmin-login') return <SuperAdminLoginPage />;

  // Auth pages (full screen, no layout)
  if (currentPage === 'login') return <LoginPage />;

  // Checkout pages (standalone)
  if (currentPage === 'checkout') return <CheckoutPage />;
  if (currentPage === 'checkout-success') return <CheckoutSuccessPage />;

  // Dashboard pages
  const dashboardPages: PageRoute[] = [
    'dashboard', 'dashboard-subscription', 'dashboard-orders', 'dashboard-profile',
  ];
  if (dashboardPages.includes(currentPage)) {
    return <DashboardRouter />;
  }

  // Admin pages
  const adminPages: PageRoute[] = [
    'admin', 'admin-users', 'admin-user-detail',
    'admin-subscriptions', 'admin-subscription-detail',
    'admin-orders', 'admin-licenses', 'admin-license-new',
  ];
  if (adminPages.includes(currentPage)) {
    return <AdminRouter />;
  }

  // SuperAdmin pages
  const superAdminPages: PageRoute[] = [
    'superadmin', 'superadmin-users', 'superadmin-orders',
    'superadmin-licenses', 'superadmin-whatsapp', 'superadmin-settings',
  ];
  if (superAdminPages.includes(currentPage)) {
    return <SuperAdminRouter />;
  }

  // Qustodio app landing page (with Navbar/Footer layout)
  if (currentPage === 'qustodio-app') {
    return (
      <>
        <Navbar />
        <main className="flex-1">
          <QustodioAppPage />
        </main>
        <Footer />
        <WhatsAppFAB />
      </>
    );
  }

  // Public pages
  switch (currentPage) {
    case 'pricing': return <PricingPage />;
    case 'features': return <FeaturesPage />;
    case 'faq': return <FaqPage />;
    case 'contact': return <ContactPage />;
    case 'privacy-policy': return <PrivacyPolicyPage />;
    case 'terms-of-service': return <TermsOfServicePage />;
    case 'home':
    default: return <HomePage />;
  }
}
