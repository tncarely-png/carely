import { NextRequest, NextResponse } from "next/server";
import { getCfContext } from "@/lib/cf-context";
import { eq, desc } from "drizzle-orm";
import { orders, users, subscriptions } from "@/db/schema";
import { PLANS } from "@/lib/constants";

export async function GET(request: NextRequest) {
  try {
    const { db } = getCfContext();
    const userId = request.nextUrl.searchParams.get("userId");
    if (!userId) {
      return NextResponse.json({ error: "userId is required" }, { status: 400 });
    }

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

    // Validate required fields
    if (!userId || !plan || !paymentMethod) {
      return NextResponse.json(
        { success: false, error: "البيانات غير مكتملة" },
        { status: 400 }
      );
    }

    // Verify the user exists
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

    // Get plan pricing from constants
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

    // Create the order linked to the real user
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

    // Create a pending subscription linked to this order
    await db.insert(subscriptions).values({
      id: subscriptionId,
      userId: user.id,
      plan,
      status: "pending",
      devicesCount,
      createdAt: now,
      updatedAt: now,
    });

    // Link subscription to order
    await db
      .update(orders)
      .set({ subscriptionId, updatedAt: now })
      .where(eq(orders.id, orderId));

    console.log(
      "[orders POST] Order created:",
      orderId,
      "for user:",
      user.id,
      "plan:",
      plan,
      "amount:",
      amountTnd
    );

    // Fetch the created records to return them
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
