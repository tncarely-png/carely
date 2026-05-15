import type { PageRoute } from '@/store';

/** URL path for each SPA route (used by navigate + direct links). */
export const ROUTE_PATHS: Partial<Record<PageRoute, string>> = {
  home: '/',
  pricing: '/pricing',
  features: '/features',
  faq: '/faq',
  contact: '/contact',
  login: '/login',
  'privacy-policy': '/privacy-policy',
  'terms-of-service': '/terms-of-service',
  dashboard: '/dashboard',
  'dashboard-subscription': '/dashboard/subscription',
  'dashboard-orders': '/dashboard/orders',
  'dashboard-profile': '/dashboard/profile',
  'qstudio-app': '/qstudio-app',
  checkout: '/checkout',
  'checkout-success': '/checkout-success',
  admin: '/admin',
  'admin-users': '/admin-users',
  'admin-orders': '/admin-orders',
  'admin-subscriptions': '/admin-subscriptions',
  'admin-licenses': '/admin-licenses',
  superadmin: '/superadmin',
  'superadmin-login': '/superadmin-login',
};

export function pathToPage(pathname: string): PageRoute {
  const p = pathname.replace(/^\/+|\/+$/g, '');
  if (!p || p === '/') return 'home';
  if (p === 'qustodio-app') return 'qstudio-app';

  const validRoutes = Object.keys(ROUTE_PATHS) as PageRoute[];
  if (validRoutes.includes(p as PageRoute)) {
    return p as PageRoute;
  }

  if (p.startsWith('dashboard/')) {
    const sub = p.slice('dashboard/'.length);
    if (sub === 'subscription') return 'dashboard-subscription';
    if (sub === 'orders') return 'dashboard-orders';
    if (sub === 'profile') return 'dashboard-profile';
    return 'dashboard';
  }

  if (p.startsWith('admin/')) return 'admin';
  if (p.startsWith('superadmin/')) return 'superadmin';

  return 'home';
}

export function pageToPath(page: PageRoute): string | undefined {
  return ROUTE_PATHS[page];
}
