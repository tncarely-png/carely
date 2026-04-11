'use client';

import React, { useState } from 'react';
import {
  LayoutDashboard,
  Users,
  FileText,
  ShoppingCart,
  Key,
  LogOut,
  Menu,
  Shield,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';
import { useAppStore, useAuthStore } from '@/store';

const navItems = [
  { id: 'admin' as const, label: 'لوحة التحكم', icon: LayoutDashboard, emoji: '📊' },
  { id: 'admin-users' as const, label: 'الزبائن', icon: Users, emoji: '👥' },
  { id: 'admin-subscriptions' as const, label: 'الاشتراكات', icon: FileText, emoji: '📋' },
  { id: 'admin-orders' as const, label: 'الطلبات', icon: ShoppingCart, emoji: '🛒' },
  { id: 'admin-licenses' as const, label: 'الكودات', icon: Key, emoji: '🔑' },
];

function SidebarContent({ currentPage, onNavigate, onLogout, userName }: {
  currentPage: string;
  onNavigate: (page: 'admin' | 'admin-users' | 'admin-subscriptions' | 'admin-orders' | 'admin-licenses') => void;
  onLogout: () => void;
  userName: string;
}) {
  return (
    <div className="flex flex-col h-full">
      {/* Logo / Brand */}
      <div className="p-4 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-carely-green flex items-center justify-center">
          <Shield className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-carely-dark">Carely Admin</h2>
          <p className="text-xs text-carely-gray/60">لوحة إدارة المتجر</p>
        </div>
      </div>

      <Separator className="bg-carely-green/10" />

      {/* Admin Info */}
      <div className="p-4">
        <div className="flex items-center gap-3 p-3 rounded-xl bg-carely-mint">
          <div className="w-9 h-9 rounded-full bg-carely-green/20 flex items-center justify-center">
            <Shield className="w-4 h-4 text-carely-green" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold text-carely-dark truncate">{userName}</p>
            <p className="text-xs text-carely-gray/60">مدير النظام</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 space-y-1">
        {navItems.map((item) => {
          const isActive = currentPage === item.id || currentPage.startsWith(item.id + '-');
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
                isActive
                  ? 'bg-carely-green text-white shadow-md shadow-carely-green/25'
                  : 'text-carely-gray hover:bg-carely-mint hover:text-carely-dark'
              }`}
            >
              <span className="text-lg">{item.emoji}</span>
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="p-3">
        <Separator className="bg-carely-green/10 mb-3" />
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-red-500 hover:bg-red-50 transition-all duration-200"
        >
          <LogOut className="w-5 h-5" />
          <span>تسجيل الخروج</span>
        </button>
      </div>
    </div>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { currentPage, navigate } = useAppStore();
  const { user, logout } = useAuthStore();
  const [sheetOpen, setSheetOpen] = useState(false);

  const handleNavigate = (page: 'admin' | 'admin-users' | 'admin-subscriptions' | 'admin-orders' | 'admin-licenses') => {
    navigate(page);
    setSheetOpen(false);
  };

  const handleLogout = () => {
    logout();
    setSheetOpen(false);
  };

  const currentPageLabel = navItems.find(
    (item) => currentPage === item.id || currentPage.startsWith(item.id + '-')
  )?.label || 'لوحة التحكم';

  return (
    <div className="min-h-screen flex flex-col bg-gray-50" dir="rtl">
      {/* Top Bar - Mobile */}
      <div className="lg:hidden sticky top-0 z-40 bg-white border-b border-carely-green/10 shadow-sm">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="text-carely-dark">
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="p-0 w-72 bg-white">
                <SheetTitle className="sr-only">القائمة</SheetTitle>
                <SidebarContent
                  currentPage={currentPage}
                  onNavigate={handleNavigate}
                  onLogout={handleLogout}
                  userName={user?.name || 'أدمن'}
                />
              </SheetContent>
            </Sheet>
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-carely-green" />
              <h1 className="font-bold text-carely-dark">{currentPageLabel}</h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-carely-gray">{user?.name}</span>
            <div className="w-8 h-8 rounded-full bg-carely-green/20 flex items-center justify-center">
              <Shield className="w-3.5 h-3.5 text-carely-green" />
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-1">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 bg-white border-l border-carely-green/10 shadow-sm z-30">
          <SidebarContent
            currentPage={currentPage}
            onNavigate={handleNavigate}
            onLogout={handleLogout}
            userName={user?.name || 'أدمن'}
          />
        </aside>

        {/* Main Content */}
        <main className="flex-1 lg:mr-64">
          <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto">
            {/* Page Title - Desktop */}
            <div className="hidden lg:block mb-6">
              <h1 className="text-2xl font-bold text-carely-dark">{currentPageLabel}</h1>
            </div>
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
