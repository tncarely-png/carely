'use client';

import React, { useState } from 'react';
import { LogOut, Menu, X, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';
import { useAppStore } from '@/store';

const navItems = [
  { id: 'superadmin' as const, label: 'الرئيسية', emoji: '🏠' },
  { id: 'superadmin-products' as const, label: 'المنتجات', emoji: '📦' },
  { id: 'superadmin-landing' as const, label: 'الصفحة الرئيسية', emoji: '🎨' },
  { id: 'superadmin-users' as const, label: 'المستخدمون', emoji: '👥' },
  { id: 'superadmin-orders' as const, label: 'الطلبات', emoji: '📋' },
  { id: 'superadmin-licenses' as const, label: 'التراخيص', emoji: '🔑' },
  { id: 'superadmin-whatsapp' as const, label: 'واتساب', emoji: '💬' },
  { id: 'superadmin-settings' as const, label: 'الإعدادات', emoji: '⚙️' },
];

function SidebarContent({ currentPage, onNavigate, onLogout }: {
  currentPage: string;
  onNavigate: (page: typeof navItems[number]['id']) => void;
  onLogout: () => void;
}) {
  return (
    <div className="flex flex-col h-full" style={{ background: '#000000', color: '#ffffff' }}>
      {/* Brand */}
      <div className="p-5 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: '#222222' }}>
          <Shield className="w-5 h-5" style={{ color: '#ffffff' }} />
        </div>
        <div>
          <h2 className="text-lg font-extrabold text-white">SuperAdmin</h2>
          <p className="text-xs" style={{ color: '#888888' }}>لوحة التحكم الرئيسية</p>
        </div>
      </div>

      <Separator style={{ background: '#333333' }} />

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const isActive = currentPage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all duration-200"
              style={{
                background: isActive ? '#ffffff' : 'transparent',
                color: isActive ? '#000000' : '#cccccc',
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = '#222222';
                  e.currentTarget.style.color = '#ffffff';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = '#cccccc';
                }
              }}
            >
              <span className="text-lg">{item.emoji}</span>
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="p-3">
        <Separator style={{ background: '#333333' }} className="mb-3" />
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all duration-200"
          style={{ color: '#ef4444' }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#1a0000';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent';
          }}
        >
          <LogOut className="w-5 h-5" />
          <span>تسجيل الخروج</span>
        </button>
      </div>
    </div>
  );
}

export default function SuperAdminLayout({ children }: { children: React.ReactNode }) {
  const { currentPage, navigate } = useAppStore();
  const [sheetOpen, setSheetOpen] = useState(false);

  const handleNavigate = (page: typeof navItems[number]['id']) => {
    navigate(page);
    setSheetOpen(false);
  };

  const handleLogout = () => {
    sessionStorage.removeItem('superadmin_token');
    sessionStorage.removeItem('superadmin_email');
    navigate('home');
    setSheetOpen(false);
  };

  const currentPageLabel = navItems.find(
    (item) => currentPage === item.id
  )?.label || 'الرئيسية';

  return (
    <div className="min-h-screen flex flex-col overflow-x-hidden" style={{ background: '#f9f9f9' }} dir="rtl">
      {/* Top Bar - Mobile */}
      <div
        className="lg:hidden sticky top-0 z-40"
        style={{
          background: '#ffffff',
          borderBottom: '1px solid #e5e5e5',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
        }}
      >
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" style={{ color: '#000000' }}>
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="p-0 w-72" style={{ background: '#000000' }}>
                <SheetTitle className="sr-only">القائمة</SheetTitle>
                <SidebarContent
                  currentPage={currentPage}
                  onNavigate={handleNavigate}
                  onLogout={handleLogout}
                />
              </SheetContent>
            </Sheet>
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5" style={{ color: '#000000' }} />
              <h1 className="font-bold" style={{ color: '#000000' }}>{currentPageLabel}</h1>
            </div>
          </div>
          <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: '#000000' }}>
            <Shield className="w-4 h-4 text-white" />
          </div>
        </div>
      </div>

      <div className="flex flex-1">
        {/* Desktop Sidebar */}
        <aside
          className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 z-30"
          style={{ background: '#000000' }}
        >
          <SidebarContent
            currentPage={currentPage}
            onNavigate={handleNavigate}
            onLogout={handleLogout}
          />
        </aside>

        {/* Main Content */}
        <main className="flex-1 lg:mr-64">
          <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto">
            <div className="hidden lg:block mb-6">
              <h1 className="text-2xl font-extrabold" style={{ color: '#000000' }}>
                {currentPageLabel}
              </h1>
            </div>
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
