import { NextRequest, NextResponse } from "next/server";
import { getCfContext } from "@/lib/cf-context";
import { eq } from "drizzle-orm";
import { orders, users, subscriptions } from "@/db/schema";

// GET /api/orders/[id] — get single order with user info
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { db } = getCfContext();

    const result = await db
      .select({
        order: orders,
        user: {
          id: users.id,
          name: users.name,
          email: users.email,
          phone: users.phone,
        },
        subscription: {
          id: subscriptions.id,
          status: subscriptions.status,
          plan: subscriptions.plan,
          startsAt: subscriptions.startsAt,
          expiresAt: subscriptions.expiresAt,
        },
      })
      .from(orders)
      .leftJoin(users, eq(orders.userId, users.id))
      .leftJoin(subscriptions, eq(orders.subscriptionId, subscriptions.id))
      .where(eq(orders.id, id))
      .get();

    if (!result) {
      return NextResponse.json(
        { success: false, error: "Order not found" },
        { status: 404 }
      );
    }

    const data = {
      ...result.order,
      user: result.user?.id ? result.user : null,
      subscription: result.subscription?.id ? result.subscription : null,
    };

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("GET /api/orders/[id] error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch order" },
      { status: 500 }
    );
  }
}

// PUT /api/orders/[id] — update order
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { db } = getCfContext();
    const body = await request.json();
    const { status, paymentRef, paidAt } = body;

    const existing = await db
      .select()
      .from(orders)
      .where(eq(orders.id, id))
      .get();

    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Order not found" },
        { status: 404 }
      );
    }

    // Build update data
    const updateFields: Record<string, unknown> = { updatedAt: new Date().toISOString() };

    if (status !== undefined) {
      const validStatuses = ["pending", "paid", "failed", "refunded"];
      if (!validStatuses.includes(status)) {
        return NextResponse.json(
          { success: false, error: "Invalid status value" },
          { status: 400 }
        );
      }
      updateFields.status = status;
    }
    if (paymentRef !== undefined) updateFields.paymentRef = paymentRef || null;
    if (paidAt !== undefined) {
      updateFields.paidAt = paidAt ? new Date(paidAt).toISOString() : null;
    }

    await db.update(orders).set(updateFields).where(eq(orders.id, id));

    // Fetch the updated order with user info
    const result = await db
      .select({
        order: orders,
        user: {
          id: users.id,
          name: users.name,
          email: users.email,
        },
      })
      .from(orders)
      .leftJoin(users, eq(orders.userId, users.id))
      .where(eq(orders.id, id))
      .get();

    const order = result
      ? { ...result.order, user: result.user?.id ? result.user : null }
      : null;

    // If status changed to "paid" and subscriptionId exists, activate subscription
    if (status === "paid" && existing.subscriptionId) {
      try {
        await db
          .update(subscriptions)
          .set({ status: "active", updatedAt: new Date().toISOString() })
          .where(eq(subscriptions.id, existing.subscriptionId));
      } catch {
        // Subscription might not exist, non-blocking
      }
    }

    return NextResponse.json({ success: true, data: order });
  } catch (error) {
    console.error("PUT /api/orders/[id] error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update order" },
      { status: 500 }
    );
  }
}
