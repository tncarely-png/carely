import { NextRequest, NextResponse } from "next/server";
import { getCfContext } from "@/lib/cf-context";
import { eq, desc, and, like, or } from "drizzle-orm";
import { orders, users, subscriptions } from "@/db/schema";
import { PLANS } from "@/lib/constants";

// GET /api/orders — list orders
// If userId provided → list user's orders
// If no userId → list ALL orders (admin/superadmin)
export async function GET(request: NextRequest) {
  try {
    const { db } = getCfContext();
    const userId = request.nextUrl.searchParams.get("userId");
    const status = request.nextUrl.searchParams.get("status");
    const limit = request.nextUrl.searchParams.get("limit");

    if (userId) {
      // User's own orders
      const result = await db
        .select({
          order: orders,
          subscription: {
            id: subscriptions.id,
            status: subscriptions.status,
            startsAt: subscriptions.startsAt,
            expiresAt: subscriptions.expiresAt,
          },
          user: {
            id: users.id,
            name: users.name,
            email: users.email,
          },
        })
        .from(orders)
        .leftJoin(users, eq(orders.userId, users.id))
        .leftJoin(subscriptions, eq(orders.subscriptionId, subscriptions.id))
        .where(eq(orders.userId, userId))
        .orderBy(desc(orders.createdAt))
        .all();

      const mappedOrders = result.map((row) => ({
        ...row.order,
        subscription: row.subscription?.id ? row.subscription : null,
        user: row.user?.id ? row.user : null,
      }));

      return NextResponse.json({ orders: mappedOrders });
    }

    // Admin: list ALL orders with user info
    const conditions = [];
    if (status && status !== "all") {
      conditions.push(eq(orders.status, status));
    }

    let query = db
      .select({
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
        userEmail: users.email,
      })
      .from(orders)
      .leftJoin(users, eq(orders.userId, users.id));

    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as typeof query;
    }

    let results = await query.orderBy(desc(orders.createdAt)).all();

    if (limit) {
      results = results.slice(0, parseInt(limit));
    }

    const allOrders = results.map((r) => ({
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
        email: r.userEmail,
      },
    }));

    return NextResponse.json({ success: true, data: allOrders });
  } catch (error) {
    console.error("[orders GET] Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { db } = getCfContext();
    const body = await request.json();
    const { userId, plan, paymentMethod, receiptData } = body;

    if (!userId || !plan || !paymentMethod) {
      return NextResponse.json(
        { success: false, error: "البيانات غير مكتملة" },
        { status: 400 }
      );
    }

    const user = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .get();

    if (!user) {
      return NextResponse.json(
        { success: false, error: "المستخدم غير موجود. سجل دخول من جديد." },
        { status: 404 }
      );
    }

    const planConfig = PLANS[plan as keyof typeof PLANS];
    if (!planConfig) {
      return NextResponse.json(
        { success: false, error: "الباقة غير صحيحة" },
        { status: 400 }
      );
    }

    const amountTnd = planConfig.priceTnd;
    const devicesCount = planConfig.devices;
    const now = new Date().toISOString();
    const orderId = crypto.randomUUID();
    const subscriptionId = crypto.randomUUID();

    await db.insert(orders).values({
      id: orderId,
      userId: user.id,
      plan,
      amountTnd,
      paymentMethod,
      receiptUrl: receiptData || null,
      status: "pending",
      createdAt: now,
      updatedAt: now,
    });

    await db.insert(subscriptions).values({
      id: subscriptionId,
      userId: user.id,
      plan,
      status: "pending",
      devicesCount,
      createdAt: now,
      updatedAt: now,
    });

    await db
      .update(orders)
      .set({ subscriptionId, updatedAt: now })
      .where(eq(orders.id, orderId));

    const order = await db
      .select()
      .from(orders)
      .where(eq(orders.id, orderId))
      .get();
    const subscription = await db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.id, subscriptionId))
      .get();

    return NextResponse.json({ success: true, order, subscription });
  } catch (error) {
    console.error("[orders POST] Error:", error);
    return NextResponse.json(
      { success: false, error: "حصل مشكل أثناء إرسال الطلب. جرب مرة أخرى." },
      { status: 500 }
    );
  }
}
