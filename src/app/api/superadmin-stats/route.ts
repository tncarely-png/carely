import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const [
      totalUsers,
      activeSubs,
      pendingOrders,
      availableLicenses,
      recentOrders,
      expiringSubs,
    ] = await Promise.all([
      // Total users
      db.user.count(),

      // Active subscriptions
      db.subscription.count({ where: { status: 'active' } }),

      // Pending orders
      db.order.count({ where: { status: 'pending' } }),

      // Available (unassigned) licenses
      db.license.count({ where: { isAssigned: false } }),

      // Recent 10 orders with user info
      db.order.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: { user: { select: { name: true, phone: true } } },
      }),

      // Expiring within 30 days
      db.subscription.findMany({
        where: {
          status: 'active',
          expiresAt: {
            gt: new Date(),
            lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          },
        },
        include: { user: { select: { id: true, name: true, phone: true } } },
        orderBy: { expiresAt: 'asc' },
      }),
    ]);

    const now = new Date();
    const processedExpiring = expiringSubs.map((s) => ({
      ...s,
      daysRemaining: Math.ceil(
        (new Date(s.expiresAt!).getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
      ),
    }));

    return NextResponse.json({
      totalUsers,
      activeSubs,
      pendingOrders,
      availableLicenses,
      recentOrders,
      expiringSubs: processedExpiring,
    });
  } catch (error) {
    console.error('[superadmin-stats] Error:', error);
    return NextResponse.json(
      { error: 'فشل تحميل الإحصائيات' },
      { status: 500 }
    );
  }
}
