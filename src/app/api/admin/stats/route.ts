import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/admin/stats — aggregate dashboard stats
export async function GET() {
  try {
    const [
      totalUsers,
      activeSubscriptions,
      expiredSubscriptions,
      silverActive,
      goldActive,
      availableLicenses,
      pendingOrders,
    ] = await Promise.all([
      // Total users
      db.user.count(),

      // Active subscriptions
      db.subscription.count({ where: { status: 'active' } }),

      // Expired subscriptions
      db.subscription.count({ where: { status: 'expired' } }),

      // Active silver
      db.subscription.count({ where: { status: 'active', plan: 'silver' } }),

      // Active gold
      db.subscription.count({ where: { status: 'active', plan: 'gold' } }),

      // Available licenses (not assigned)
      db.license.count({ where: { isAssigned: false } }),

      // Pending orders
      db.order.count({ where: { status: 'pending' } }),
    ]);

    // Total revenue from paid orders
    const paidOrders = await db.order.aggregate({
      _sum: { amountTnd: true },
      where: { status: 'paid' },
    });

    const totalRevenue = paidOrders._sum.amountTnd || 0;

    return NextResponse.json({
      success: true,
      data: {
        totalUsers,
        activeSubscriptions,
        expiredSubscriptions,
        totalRevenue,
        silverActive,
        goldActive,
        availableLicenses,
        pendingOrders,
      },
    });
  } catch (error) {
    console.error('GET /api/admin/stats error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch stats' },
      { status: 500 }
    );
  }
}
