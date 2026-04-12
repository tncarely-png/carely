'use client';

import { useAuthStore, useAppStore } from '@/store';
import type { PageRoute } from '@/store';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from '@/components/ui/sheet';
import {
  LayoutDashboard,
  Shield,
  ClipboardList,
  UserCircle,
  LogOut,
  Menu,
} from 'lucide-react';

const navItems: { id: PageRoute; label: string; icon: React.ReactNode }[] = [
  { id: 'dashboard', label: 'الرئيسية', icon: <LayoutDashboard className="h-5 w-5" /> },
  { id: 'dashboard-subscription', label: 'اشتراكي', icon: <Shield className="h-5 w-5" /> },
  { id: 'dashboard-orders', label: 'سجل الدفع', icon: <ClipboardList className="h-5 w-5" /> },
  { id: 'dashboard-profile', label: 'حسابي', icon: <UserCircle className="h-5 w-5" /> },
];

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const user = useAuthStore((s) => s.user);
  const currentPage = useAppStore((s) => s.currentPage);
  const navigate = useAppStore((s) => s.navigate);
  const logout = useAuthStore((s) => s.logout);

  const handleNav = (page: PageRoute) => {
    navigate(page);
    onNavigate?.();
  };

  return (
    <div className="flex flex-col h-full" dir="rtl">
      {/* User Info */}
      <div className="p-5 pb-3">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-10 h-10 rounded-full bg-carely-light flex items-center justify-center text-carely-green font-bold text-lg">
            {user?.name?.charAt(0) || '?'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-carely-dark text-sm truncate">{user?.name || 'مستخدم'}</p>
            <p className="text-xs text-carely-gray truncate" dir="ltr">{user?.phone || ''}</p>
          </div>
        </div>
      </div>

      <Separator />

      {/* Nav Links */}
      <nav className="flex-1 p-3 space-y-1">
        {navItems.map((item) => {
          const isActive = currentPage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleNav(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                isActive
                  ? 'bg-carely-green text-white shadow-md'
                  : 'text-carely-gray hover:bg-carely-light hover:text-carely-dark'
              }`}
            >
              {item.icon}
              {item.label}
            </button>
          );
        })}
      </nav>

      <Separator />

      {/* Logout */}
      <div className="p-3">
        <button
          onClick={() => {
            logout();
            onNavigate?.();
          }}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-red-500 hover:bg-red-50 transition-all"
        >
          <LogOut className="h-5 w-5" />
          تسجيل الخروج
        </button>
      </div>
    </div>
  );
}

export default function DashboardSidebar() {
  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 shrink-0 flex-col h-full bg-white rounded-2xl shadow-lg border border-carely-light overflow-hidden">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar (Sheet) */}
      <div className="md:hidden fixed top-4 right-4 z-40">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="rounded-xl bg-white shadow-md border-carely-light h-10 w-10">
              <Menu className="h-5 w-5 text-carely-dark" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="p-0 w-72">
            <SheetTitle className="sr-only">القائمة</SheetTitle>
            <SidebarContent />
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}
