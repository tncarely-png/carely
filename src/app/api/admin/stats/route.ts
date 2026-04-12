import { NextResponse } from 'next/server';
import { getCfContext } from '@/lib/cf-context';
import { eq, and, sql, desc } from 'drizzle-orm';
import { users, subscriptions, orders, licenses } from '@/db/schema';

// GET /api/admin/stats — aggregate dashboard stats
export async function GET() {
  try {
    const { db } = getCfContext();

    const [
      totalUsersRes,
      activeSubscriptionsRes,
      expiredSubscriptionsRes,
      silverActiveRes,
      goldActiveRes,
      availableLicensesRes,
      pendingOrdersRes,
      totalRevenueRes,
    ] = await Promise.all([
      // Total users
      db.select({ c: sql<number>`count(*)` }).from(users).then(r => r[0].c),

      // Active subscriptions
      db.select({ c: sql<number>`count(*)` }).from(subscriptions)
        .where(eq(subscriptions.status, 'active'))
        .then(r => r[0].c),

      // Expired subscriptions
      db.select({ c: sql<number>`count(*)` }).from(subscriptions)
        .where(eq(subscriptions.status, 'expired'))
        .then(r => r[0].c),

      // Active silver
      db.select({ c: sql<number>`count(*)` }).from(subscriptions)
        .where(and(eq(subscriptions.status, 'active'), eq(subscriptions.plan, 'silver')))
        .then(r => r[0].c),

      // Active gold
      db.select({ c: sql<number>`count(*)` }).from(subscriptions)
        .where(and(eq(subscriptions.status, 'active'), eq(subscriptions.plan, 'gold')))
        .then(r => r[0].c),

      // Available licenses (not assigned)
      db.select({ c: sql<number>`count(*)` }).from(licenses)
        .where(eq(licenses.isAssigned, false))
        .then(r => r[0].c),

      // Pending orders
      db.select({ c: sql<number>`count(*)` }).from(orders)
        .where(eq(orders.status, 'pending'))
        .then(r => r[0].c),

      // Total revenue from paid orders
      db.select({ t: sql<number>`coalesce(sum(amount_tnd), 0)` }).from(orders)
        .where(eq(orders.status, 'paid'))
        .then(r => r[0].t),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        totalUsers: totalUsersRes,
        activeSubscriptions: activeSubscriptionsRes,
        expiredSubscriptions: expiredSubscriptionsRes,
        totalRevenue: totalRevenueRes,
        silverActive: silverActiveRes,
        goldActive: goldActiveRes,
        availableLicenses: availableLicensesRes,
        pendingOrders: pendingOrdersRes,
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
