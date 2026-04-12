import { NextRequest, NextResponse } from "next/server";
import { getCfContext } from "@/lib/cf-context";
import { eq } from "drizzle-orm";
import { subscriptions, users, licenses } from "@/db/schema";

// GET /api/subscriptions/[id] — single subscription with user info
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { db } = getCfContext();

    const result = await db
      .select({
        subscription: subscriptions,
        user: {
          id: users.id,
          name: users.name,
          email: users.email,
          phone: users.phone,
          address: users.address,
          wilaya: users.wilaya,
        },
        license: {
          id: licenses.id,
          qustodioEmail: licenses.qustodioEmail,
          plan: licenses.plan,
        },
      })
      .from(subscriptions)
      .leftJoin(users, eq(subscriptions.userId, users.id))
      .leftJoin(licenses, eq(subscriptions.licenseId, licenses.id))
      .where(eq(subscriptions.id, id))
      .get();

    if (!result) {
      return NextResponse.json(
        { success: false, error: "Subscription not found" },
        { status: 404 }
      );
    }

    const data = {
      ...result.subscription,
      user: result.user?.id ? result.user : null,
      license: result.license?.id ? result.license : null,
    };

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("GET /api/subscriptions/[id] error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch subscription" },
      { status: 500 }
    );
  }
}

// PUT /api/subscriptions/[id] — update subscription
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { db } = getCfContext();
    const body = await request.json();

    const existing = await db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.id, id))
      .get();

    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Subscription not found" },
        { status: 404 }
      );
    }

    const updateFields: Record<string, unknown> = { updatedAt: new Date().toISOString() };

    if (body.plan !== undefined) {
      if (!["silver", "gold"].includes(body.plan)) {
        return NextResponse.json(
          { success: false, error: "plan must be silver or gold" },
          { status: 400 }
        );
      }
      updateFields.plan = body.plan;
    }

    if (body.status !== undefined) {
      const validStatuses = ["active", "expired", "pending", "cancelled"];
      if (!validStatuses.includes(body.status)) {
        return NextResponse.json(
          { success: false, error: "Invalid status value" },
          { status: 400 }
        );
      }
      updateFields.status = body.status;
    }

    if (body.qustodioEmail !== undefined)
      updateFields.qustodioEmail = body.qustodioEmail || null;
    if (body.qustodioPassword !== undefined)
      updateFields.qustodioPassword = body.qustodioPassword || null;
    if (body.activationCode !== undefined)
      updateFields.activationCode = body.activationCode || null;
    if (body.startsAt !== undefined)
      updateFields.startsAt = body.startsAt ? new Date(body.startsAt).toISOString() : null;
    if (body.expiresAt !== undefined)
      updateFields.expiresAt = body.expiresAt ? new Date(body.expiresAt).toISOString() : null;
    if (body.notes !== undefined) updateFields.notes = body.notes || null;
    if (body.autoRenew !== undefined) updateFields.autoRenew = Boolean(body.autoRenew);

    await db
      .update(subscriptions)
      .set(updateFields)
      .where(eq(subscriptions.id, id));

    // Fetch the updated subscription with user and license info
    const result = await db
      .select({
        subscription: subscriptions,
        user: {
          id: users.id,
          name: users.name,
          email: users.email,
        },
        license: {
          id: licenses.id,
          qustodioEmail: licenses.qustodioEmail,
        },
      })
      .from(subscriptions)
      .leftJoin(users, eq(subscriptions.userId, users.id))
      .leftJoin(licenses, eq(subscriptions.licenseId, licenses.id))
      .where(eq(subscriptions.id, id))
      .get();

    const data = result
      ? {
          ...result.subscription,
          user: result.user?.id ? result.user : null,
          license: result.license?.id ? result.license : null,
        }
      : null;

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("PUT /api/subscriptions/[id] error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update subscription" },
      { status: 500 }
    );
  }
}
