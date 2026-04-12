import { NextRequest, NextResponse } from "next/server";
import { getCfContext } from "@/lib/cf-context";
import { eq } from "drizzle-orm";
import { licenses, users, subscriptions } from "@/db/schema";

// POST /api/licenses/assign — assign a license to a user + subscription
export async function POST(request: NextRequest) {
  try {
    const { db } = getCfContext();
    const body = await request.json();
    const { licenseId, userId, subscriptionId } = body;

    if (!licenseId || !userId || !subscriptionId) {
      return NextResponse.json(
        { success: false, error: "licenseId, userId, and subscriptionId are required" },
        { status: 400 }
      );
    }

    // Verify license exists and is not assigned
    const license = await db
      .select()
      .from(licenses)
      .where(eq(licenses.id, licenseId))
      .get();

    if (!license) {
      return NextResponse.json(
        { success: false, error: "License not found" },
        { status: 404 }
      );
    }
    if (license.isAssigned) {
      return NextResponse.json(
        { success: false, error: "License is already assigned" },
        { status: 400 }
      );
    }

    // Verify user exists
    const user = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .get();

    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    // Verify subscription exists
    const subscription = await db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.id, subscriptionId))
      .get();

    if (!subscription) {
      return NextResponse.json(
        { success: false, error: "Subscription not found" },
        { status: 404 }
      );
    }

    const now = new Date();
    const oneYearLater = new Date(now);
    oneYearLater.setFullYear(oneYearLater.getFullYear() + 1);

    const nowIso = now.toISOString();
    const expiresIso = oneYearLater.toISOString();

    // Update license
    await db
      .update(licenses)
      .set({
        isAssigned: true,
        assignedToUser: userId,
        assignedAt: nowIso,
        updatedAt: nowIso,
      })
      .where(eq(licenses.id, licenseId));

    // Update subscription with license credentials and activate
    await db
      .update(subscriptions)
      .set({
        qustodioEmail: license.qustodioEmail,
        qustodioPassword: license.qustodioPassword,
        status: "active",
        startsAt: nowIso,
        expiresAt: expiresIso,
        licenseId: licenseId,
        updatedAt: nowIso,
      })
      .where(eq(subscriptions.id, subscriptionId));

    // Fetch the updated records
    const updatedLicense = await db
      .select()
      .from(licenses)
      .where(eq(licenses.id, licenseId))
      .get();

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
      .where(eq(subscriptions.id, subscriptionId))
      .get();

    const updatedSubscription = result
      ? { ...result.subscription, user: result.user?.id ? result.user : null }
      : null;

    return NextResponse.json({
      success: true,
      data: {
        license: updatedLicense,
        subscription: updatedSubscription,
      },
    });
  } catch (error) {
    console.error("POST /api/licenses/assign error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to assign license" },
      { status: 500 }
    );
  }
}
