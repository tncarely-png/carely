import { NextRequest, NextResponse } from 'next/server';
import { getCfContext } from '@/lib/cf-context';
import { eq, and, sql, desc, like, or, inArray } from 'drizzle-orm';
import { users, subscriptions, orders } from '@/db/schema';

// GET /api/admin/users — list all users with optional filters
export async function GET(request: NextRequest) {
  try {
    const { db } = getCfContext();
    const { searchParams } = new URL(request.url);
    const plan = searchParams.get('plan');
    const search = searchParams.get('search');

    // Build where conditions for users
    let userRows;
    if (search) {
      userRows = await db.select().from(users)
        .where(or(
          like(users.name, `%${search}%`),
          like(users.phone, `%${search}%`)
        ))
        .orderBy(desc(users.createdAt))
        .all();
    } else {
      userRows = await db.select().from(users)
        .orderBy(desc(users.createdAt))
        .all();
    }

    // If plan filter, get user IDs that have a subscription with that plan
    let filteredUserIds: Set<string> | null = null;
    if (plan) {
      const subRows = await db.select({ userId: subscriptions.userId })
        .from(subscriptions)
        .where(eq(subscriptions.plan, plan))
        .all();
      filteredUserIds = new Set(subRows.map(r => r.userId));
    }

    // Filter and enrich users
    const enrichedUsers = [];

    for (const user of userRows) {
      // Apply plan filter
      if (filteredUserIds && !filteredUserIds.has(user.id)) {
        continue;
      }

      // Get subscriptions for this user
      const userSubs = await db.select().from(subscriptions)
        .where(eq(subscriptions.userId, user.id))
        .orderBy(desc(subscriptions.createdAt))
        .all();

      // Get orders for this user
      const userOrders = await db.select().from(orders)
        .where(eq(orders.userId, user.id))
        .orderBy(desc(orders.createdAt))
        .all();

      enrichedUsers.push({
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        address: user.address,
        wilaya: user.wilaya,
        role: user.role,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        subscriptions: userSubs.map(s => ({
          id: s.id,
          plan: s.plan,
          status: s.status,
          startsAt: s.startsAt,
          expiresAt: s.expiresAt,
        })),
        orders: userOrders.map(o => ({
          id: o.id,
          plan: o.plan,
          amountTnd: o.amountTnd,
          status: o.status,
          createdAt: o.createdAt,
        })),
      });
    }

    return NextResponse.json({ success: true, data: enrichedUsers });
  } catch (error) {
    console.error('GET /api/admin/users error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}
