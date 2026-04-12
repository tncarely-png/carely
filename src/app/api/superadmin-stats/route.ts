import { NextResponse } from 'next/server';
import { getCfContext } from '@/lib/cf-context';
import { eq, and, sql, desc, gte, lte } from 'drizzle-orm';
import { users, subscriptions, orders, licenses } from '@/db/schema';

export async function GET() {
  try {
    const { db } = getCfContext();

    const nowIso = new Date().toISOString();
    const thirtyDaysFromNowIso = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

    const [
      totalUsers,
      activeSubs,
      pendingOrders,
      availableLicenses,
      recentOrdersRows,
      expiringSubsRows,
    ] = await Promise.all([
      // Total users
      db.select({ c: sql<number>`count(*)` }).from(users).then(r => r[0].c),

      // Active subscriptions
      db.select({ c: sql<number>`count(*)` }).from(subscriptions)
        .where(eq(subscriptions.status, 'active'))
        .then(r => r[0].c),

      // Pending orders
      db.select({ c: sql<number>`count(*)` }).from(orders)
        .where(eq(orders.status, 'pending'))
        .then(r => r[0].c),

      // Available (unassigned) licenses
      db.select({ c: sql<number>`count(*)` }).from(licenses)
        .where(eq(licenses.isAssigned, false))
        .then(r => r[0].c),

      // Recent 10 orders with user info (join)
      db.select({
        id: orders.id,
        userId: orders.userId,
        subscriptionId: orders.subscriptionId,
        plan: orders.plan,
        amountTnd: orders.amountTnd,
        paymentMethod: orders.paymentMethod,
        paymentRef: orders.paymentRef,
        receiptUrl: orders.receiptUrl,
        status: orders.status,
        paidAt: orders.paidAt,
        createdAt: orders.createdAt,
        updatedAt: orders.updatedAt,
        userName: users.name,
        userPhone: users.phone,
      })
        .from(orders)
        .leftJoin(users, eq(orders.userId, users.id))
        .orderBy(desc(orders.createdAt))
        .limit(10)
        .all(),

      // Expiring within 30 days (active subs expiring between now and 30 days)
      db.select({
        id: subscriptions.id,
        userId: subscriptions.userId,
        plan: subscriptions.plan,
        status: subscriptions.status,
        startsAt: subscriptions.startsAt,
        expiresAt: subscriptions.expiresAt,
        userName: users.name,
        userPhone: users.phone,
        userIdField: users.id,
      })
        .from(subscriptions)
        .leftJoin(users, eq(subscriptions.userId, users.id))
        .where(and(
          eq(subscriptions.status, 'active'),
          gte(subscriptions.expiresAt, nowIso),
          lte(subscriptions.expiresAt, thirtyDaysFromNowIso),
        ))
        .orderBy(subscriptions.expiresAt)
        .all(),
    ]);

    // Format recent orders with nested user object
    const recentOrders = recentOrdersRows.map(r => ({
      id: r.id,
      userId: r.userId,
      subscriptionId: r.subscriptionId,
      plan: r.plan,
      amountTnd: r.amountTnd,
      paymentMethod: r.paymentMethod,
      paymentRef: r.paymentRef,
      receiptUrl: r.receiptUrl,
      status: r.status,
      paidAt: r.paidAt,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
      user: {
        name: r.userName,
        phone: r.userPhone,
      },
    }));

    // Format expiring subscriptions with daysRemaining
    const now = new Date();
    const expiringSubs = expiringSubsRows.map(s => ({
      id: s.id,
      userId: s.userId,
      plan: s.plan,
      status: s.status,
      startsAt: s.startsAt,
      expiresAt: s.expiresAt,
      user: {
        id: s.userIdField,
        name: s.userName,
        phone: s.userPhone,
      },
      daysRemaining: s.expiresAt
        ? Math.ceil((new Date(s.expiresAt).getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
        : 0,
    }));

    return NextResponse.json({
      totalUsers,
      activeSubs,
      pendingOrders,
      availableLicenses,
      recentOrders,
      expiringSubs,
    });
  } catch (error) {
    console.error('[superadmin-stats] Error:', error);
    return NextResponse.json(
      { error: 'فشل تحميل الإحصائيات' },
      { status: 500 }
    );
  }
}
