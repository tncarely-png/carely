import { NextRequest, NextResponse } from "next/server";
import { getCfContext } from "@/lib/cf-context";
import { eq, and, desc } from "drizzle-orm";
import { subscriptions, users, licenses } from "@/db/schema";

// GET /api/subscriptions — list subscriptions with optional filters
export async function GET(request: NextRequest) {
  try {
    const { db } = getCfContext();
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const status = searchParams.get("status");
    const plan = searchParams.get("plan");

    const conditions = [];
    if (userId) conditions.push(eq(subscriptions.userId, userId));
    if (status) conditions.push(eq(subscriptions.status, status));
    if (plan) conditions.push(eq(subscriptions.plan, plan));

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
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(subscriptions.createdAt))
      .all();

    const data = result.map((row) => ({
      ...row.subscription,
      user: row.user?.id ? row.user : null,
      license: row.license?.id ? row.license : null,
    }));

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("GET /api/subscriptions error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch subscriptions" },
      { status: 500 }
    );
  }
}

// POST /api/subscriptions — create a new subscription
export async function POST(request: NextRequest) {
  try {
    const { db } = getCfContext();
    const body = await request.json();
    const { userId, plan, devicesCount, licenseId } = body;

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "userId is required" },
        { status: 400 }
      );
    }

    if (plan && !["silver", "gold"].includes(plan)) {
      return NextResponse.json(
        { success: false, error: "plan must be silver or gold" },
        { status: 400 }
      );
    }

    const now = new Date().toISOString();
    const id = crypto.randomUUID();

    await db.insert(subscriptions).values({
      id,
      userId,
      plan: plan || "silver",
      devicesCount: devicesCount || 5,
      licenseId: licenseId || null,
      status: "pending",
      createdAt: now,
      updatedAt: now,
    });

    // Fetch the created subscription with user info
    const result = await db
      .select({
        subscription: subscriptions,
        user: {
          id: users.id,
          name: users.name,
          email: users.email,
        },
      })
      .from(subscriptions)
      .leftJoin(users, eq(subscriptions.userId, users.id))
      .where(eq(subscriptions.id, id))
      .get();

    const data = result
      ? { ...result.subscription, user: result.user?.id ? result.user : null }
      : null;

    return NextResponse.json({ success: true, data }, { status: 201 });
  } catch (error) {
    console.error("POST /api/subscriptions error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create subscription" },
      { status: 500 }
    );
  }
}
