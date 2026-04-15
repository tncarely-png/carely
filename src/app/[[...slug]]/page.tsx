'use client';

import { useEffect } from 'react';
import { useAppStore, useAuthStore, type PageRoute } from '@/store';
import { PLANS } from '@/lib/constants';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check } from 'lucide-react';

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
  ProductDetailPage,
} from '@/components/home';

// Legal
import PrivacyPolicyPage from '@/components/legal/PrivacyPolicyPage';
import TermsOfServicePage from '@/components/legal/TermsOfServicePage';

// Layout
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import WhatsAppFAB from '@/components/layout/WhatsAppFAB';
import { WhatsAppAgentPopup } from '@/components/shared/WhatsAppAgentPopup';

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
  const { navigate, setSelectedPlan } = useAppStore();
  const user = useAuthStore((s) => s.user);

  const handleBuy = (plan: 'silver' | 'gold') => {
    if (!user) {
      navigate('login');
      return;
    }
    setSelectedPlan(plan);
    navigate('checkout');
  };

  return (
    <>
      <Navbar />
      <main className="flex-1">
        {/* Pricing Section */}
        <section className="py-16 md:py-20 px-4">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-3xl md:text-4xl font-extrabold text-center text-carely-dark mb-4">
              أسعارنا
            </h1>
            <p className="text-center text-carely-gray text-lg mb-12">
              اختار الباقة المناسبة لعيلتك — كل الباقات تشمل سنة كاملة
            </p>

            {/* Pricing Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 items-start">
              {/* SILVER */}
              <div className="carely-card carely-top-accent p-6 flex flex-col">
                <div className="mb-4">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-3xl">{PLANS.silver.icon}</span>
                    <div>
                      <h3 className="text-xl font-extrabold text-carely-dark">
                        {PLANS.silver.displayName}
                      </h3>
                    </div>
                  </div>
                  <p className="text-sm text-carely-gray mt-2">
                    مناسبة للعيلة الصغيرة
                  </p>
                </div>

                <div className="mb-4">
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-extrabold text-carely-green">
                      {PLANS.silver.priceTnd}
                    </span>
                    <span className="text-lg text-carely-gray font-medium">دت</span>
                  </div>
                  <p className="text-sm text-carely-gray">/ سنة</p>
                </div>

                <div className="mb-5">
                  <Badge
                    variant="secondary"
                    className="bg-gray-100 text-gray-700 px-3 py-1 text-sm font-bold"
                  >
                    {PLANS.silver.devices} أجهزة
                  </Badge>
                </div>

                <ul className="flex flex-col gap-2.5 mb-6 flex-1">
                  {PLANS.silver.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2 text-sm">
                      <Check className="size-4 text-carely-green shrink-0 mt-0.5" />
                      <span className="text-carely-gray">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  variant="outline"
                  className="w-full border-carely-silver text-carely-gray hover:bg-carely-silver hover:text-white font-bold rounded-full py-3"
                  onClick={() => handleBuy('silver')}
                >
                  اشتري
                </Button>
              </div>

              {/* GOLD */}
              <div className="carely-card-featured carely-top-accent-gold p-6 flex flex-col relative">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge className="bg-carely-gold text-white px-4 py-1 text-sm font-bold shadow-md">
                    ⭐ الأكثر شراءً
                  </Badge>
                </div>

                <div className="mb-4 mt-2">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-3xl">{PLANS.gold.icon}</span>
                    <div>
                      <h3 className="text-xl font-extrabold text-carely-dark">
                        {PLANS.gold.displayName}
                      </h3>
                    </div>
                  </div>
                  <p className="text-sm text-carely-gray mt-2">
                    للعيلة اللي تحب الحماية الكاملة
                  </p>
                </div>

                <div className="mb-4">
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-extrabold text-carely-green">
                      {PLANS.gold.priceTnd}
                    </span>
                    <span className="text-lg text-carely-gray font-medium">دت</span>
                  </div>
                  <p className="text-sm text-carely-gray">/ سنة</p>
                </div>

                <div className="mb-5">
                  <Badge className="bg-carely-gold/10 text-carely-gold px-3 py-1 text-sm font-bold border border-carely-gold/20">
                    {PLANS.gold.devices} أجهزة
                  </Badge>
                </div>

                <ul className="flex flex-col gap-2.5 mb-6 flex-1">
                  {PLANS.gold.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2 text-sm">
                      <Check className="size-4 text-carely-green shrink-0 mt-0.5" />
                      <span className="text-carely-gray">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  className="w-full carely-btn-primary font-bold py-3"
                  onClick={() => handleBuy('gold')}
                >
                  اشتري
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Product Showcase */}
        <section className="py-12 px-4">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-extrabold text-center text-carely-dark mb-4">
              تطبيقاتنا
            </h2>
            <p className="text-center text-carely-gray text-lg mb-10">
              اكتشف باقي تطبيقاتنا للعيلة التونسية
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
  const { navigate, openWhatsAppPopup } = useAppStore();
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
                <button
                  onClick={() => openWhatsAppPopup('مرحبا، أريد الاستفسار عن اشتراك Carely.tn')}
                  className="carely-btn-primary inline-block"
                >
                  تواصل على واتساب
                </button>
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
      case 'superadmin-products': return <SuperAdminProducts />;
      case 'superadmin-landing': return <SuperAdminLandingPage />;
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
  const whatsappPopupOpen = useAppStore((s) => s.whatsappPopupOpen);
  const whatsappPopupMessage = useAppStore((s) => s.whatsappPopupMessage);
  const closeWhatsAppPopup = useAppStore((s) => s.closeWhatsAppPopup);

  // Seed on first load
  useEffect(() => {
    fetch('/api/seed').catch(() => {});
  }, []);

  // Detect /superadmin URL path → show PIN gate or skip if already verified
  const isSuperAdminPath = typeof window !== 'undefined'
    && window.location.pathname.replace(/\/+$/, '') === '/superadmin';
  const pinAlreadyOk = typeof window !== 'undefined'
    && sessionStorage.getItem('sa_pin_ok') === '1';

  useEffect(() => {
    if (!isSuperAdminPath) return;
    if (pinAlreadyOk) {
      useAppStore.getState().navigate('superadmin-login');
    } else {
      useAppStore.getState().navigate('superadmin-pin-gate');
    }
  }, []);

  // Dashboard pages
  const dashboardPages: PageRoute[] = [
    'dashboard', 'dashboard-subscription', 'dashboard-orders', 'dashboard-profile',
  ];

  // Admin pages
  const adminPages: PageRoute[] = [
    'admin', 'admin-users', 'admin-user-detail',
    'admin-subscriptions', 'admin-subscription-detail',
    'admin-orders', 'admin-licenses', 'admin-license-new',
  ];

  // SuperAdmin pages
  const superAdminPages: PageRoute[] = [
    'superadmin', 'superadmin-products', 'superadmin-landing',
    'superadmin-users', 'superadmin-orders',
    'superadmin-licenses', 'superadmin-whatsapp', 'superadmin-settings',
  ];

  // Determine page content (no early returns so WhatsAppAgentPopup always renders)
  let pageContent: React.ReactNode;

  if (currentPage === 'superadmin-pin-gate') {
    pageContent = <SuperAdminPinGate />;
  } else if (currentPage === 'superadmin-login') {
    pageContent = <SuperAdminLoginPage />;
  } else if (currentPage === 'login') {
    pageContent = <LoginPage />;
  } else if (currentPage === 'checkout') {
    pageContent = <CheckoutPage />;
  } else if (currentPage === 'checkout-success') {
    pageContent = <CheckoutSuccessPage />;
  } else if (dashboardPages.includes(currentPage)) {
    pageContent = <DashboardRouter />;
  } else if (adminPages.includes(currentPage)) {
    pageContent = <AdminRouter />;
  } else if (superAdminPages.includes(currentPage)) {
    pageContent = <SuperAdminRouter />;
  } else if (currentPage === 'qustodio-app') {
    pageContent = (
      <>
        <Navbar />
        <main className="flex-1">
          <QustodioAppPage />
        </main>
        <Footer />
        <WhatsAppFAB />
      </>
    );
  } else if (currentPage === 'product-detail') {
    pageContent = <ProductDetailPage />;
  } else {
    switch (currentPage) {
      case 'pricing': pageContent = <PricingPage />; break;
      case 'features': pageContent = <FeaturesPage />; break;
      case 'faq': pageContent = <FaqPage />; break;
      case 'contact': pageContent = <ContactPage />; break;
      case 'privacy-policy': pageContent = <PrivacyPolicyPage />; break;
      case 'terms-of-service': pageContent = <TermsOfServicePage />; break;
      case 'home':
      default: pageContent = <HomePage />; break;
    }
  }

  return (
    <>
      {pageContent}
      <WhatsAppAgentPopup
        open={whatsappPopupOpen}
        onClose={closeWhatsAppPopup}
        message={whatsappPopupMessage}
      />
    </>
  );
}
