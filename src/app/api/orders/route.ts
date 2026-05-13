import { NextRequest, NextResponse } from "next/server";
import { getCfContextAsync } from "@/lib/cf-context";
import { eq, desc, and, gt } from "drizzle-orm";
import { orders, users, subscriptions } from "@/db/schema";
import { PLANS, PAYMENT_METHODS } from "@/lib/constants";

const IDEM_TTL_SEC = 60 * 60 * 48; // 48h
const RAPID_DEDUP_MS = 3 * 60 * 1000; // 3 min — same plan pending (double-click / flaky network)

// GET /api/orders — list orders
// If userId provided → list user's orders
// If no userId → list ALL orders (admin/superadmin)
export async function GET(request: NextRequest) {
  try {
    const { db } = await getCfContextAsync();
    const userId = request.nextUrl.searchParams.get("userId");
    const status = request.nextUrl.searchParams.get("status");
    const limit = request.nextUrl.searchParams.get("limit");

    if (userId) {
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
      results = results.slice(0, parseInt(limit, 10));
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
    const { db, kv } = await getCfContextAsync();
    const body = await request.json();
    const { userId, plan, paymentMethod, receiptData, idempotencyKey } = body;

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

    if (!PAYMENT_METHODS.some((m) => m.id === paymentMethod)) {
      return NextResponse.json(
        { success: false, error: "طريقة الدفع غير صالحة" },
        { status: 400 }
      );
    }

    const idem =
      typeof idempotencyKey === "string" &&
      idempotencyKey.length >= 8 &&
      idempotencyKey.length <= 200
        ? idempotencyKey
        : null;

    if (idem) {
      try {
        const cached = await kv.get(`idem:order:${userId}:${idem}`);
        if (cached) {
          const parsed = JSON.parse(cached) as {
            orderId: string;
            subscriptionId: string;
          };
          const order = await db
            .select()
            .from(orders)
            .where(eq(orders.id, parsed.orderId))
            .get();
          const subscription = await db
            .select()
            .from(subscriptions)
            .where(eq(subscriptions.id, parsed.subscriptionId))
            .get();
          if (order && subscription) {
            return NextResponse.json({
              success: true,
              order,
              subscription,
              idempotentReplay: true,
            });
          }
        }
      } catch {
        // KV optional — continue
      }
    }

    const cutoffIso = new Date(Date.now() - RAPID_DEDUP_MS).toISOString();
    const recentDup = await db
      .select()
      .from(orders)
      .where(
        and(
          eq(orders.userId, user.id),
          eq(orders.plan, plan),
          eq(orders.status, "pending"),
          gt(orders.createdAt, cutoffIso)
        )
      )
      .orderBy(desc(orders.createdAt))
      .limit(1)
      .get();

    if (recentDup?.subscriptionId) {
      const subscription = await db
        .select()
        .from(subscriptions)
        .where(eq(subscriptions.id, recentDup.subscriptionId))
        .get();
      if (subscription) {
        return NextResponse.json({
          success: true,
          order: recentDup,
          subscription,
          deduped: true,
        });
      }
    }

    const amountTnd = planConfig.priceTnd;
    const devicesCount = planConfig.devices;
    const now = new Date().toISOString();
    const orderId = crypto.randomUUID();
    const subscriptionId = crypto.randomUUID();

    try {
      await db.batch([
        db.insert(orders).values({
          id: orderId,
          userId: user.id,
          plan,
          amountTnd,
          paymentMethod,
          receiptUrl: receiptData || null,
          status: "pending",
          createdAt: now,
          updatedAt: now,
        }),
        db.insert(subscriptions).values({
          id: subscriptionId,
          userId: user.id,
          plan,
          status: "pending",
          devicesCount,
          createdAt: now,
          updatedAt: now,
        }),
        db
          .update(orders)
          .set({ subscriptionId, updatedAt: now })
          .where(eq(orders.id, orderId)),
      ]);
    } catch (batchErr) {
      console.error("[orders POST] batch failed, falling back to sequential:", batchErr);
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
    }

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

    if (idem && order && subscription) {
      try {
        await kv.put(
          `idem:order:${userId}:${idem}`,
          JSON.stringify({ orderId, subscriptionId }),
          { expirationTtl: IDEM_TTL_SEC }
        );
      } catch {
        // non-fatal
      }
    }

    return NextResponse.json({ success: true, order, subscription });
  } catch (error) {
    console.error("[orders POST] Error:", error);
    return NextResponse.json(
      { success: false, error: "حصل مشكل أثناء إرسال الطلب. جرب مرة أخرى." },
      { status: 500 }
    );
  }
}
