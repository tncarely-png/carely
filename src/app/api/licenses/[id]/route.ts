import { NextRequest, NextResponse } from "next/server";
import { getCfContext } from "@/lib/cf-context";
import { eq } from "drizzle-orm";
import { licenses, subscriptions, users } from "@/db/schema";

// GET /api/licenses/[id] — single license
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { db } = getCfContext();

    const result = await db
      .select({
        license: licenses,
        subscriptionId: subscriptions.id,
        subscriptionStatus: subscriptions.status,
        userId: users.id,
        userName: users.name,
        userEmail: users.email,
      })
      .from(licenses)
      .leftJoin(subscriptions, eq(licenses.id, subscriptions.licenseId))
      .leftJoin(users, eq(subscriptions.userId, users.id))
      .where(eq(licenses.id, id))
      .all();

    if (result.length === 0) {
      return NextResponse.json(
        { success: false, error: "License not found" },
        { status: 404 }
      );
    }

    const { license, userName, userEmail } = result[0];

    const formatted = {
      ...license,
      assignedUserName: userName || null,
      assignedUserEmail: userEmail || null,
    };

    return NextResponse.json({ success: true, data: formatted });
  } catch (error) {
    console.error("GET /api/licenses/[id] error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch license" },
      { status: 500 }
    );
  }
}

// PUT /api/licenses/[id] — update license
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
      .from(licenses)
      .where(eq(licenses.id, id))
      .get();

    if (!existing) {
      return NextResponse.json(
        { success: false, error: "License not found" },
        { status: 404 }
      );
    }

    // Check for duplicate email if changing it
    if (body.qustodioEmail && body.qustodioEmail !== existing.qustodioEmail) {
      const duplicate = await db
        .select()
        .from(licenses)
        .where(eq(licenses.qustodioEmail, body.qustodioEmail))
        .get();

      if (duplicate) {
        return NextResponse.json(
          { success: false, error: "A license with this qustodioEmail already exists" },
          { status: 409 }
        );
      }
    }

    const updateFields: Record<string, unknown> = { updatedAt: new Date().toISOString() };

    if (body.qustodioEmail !== undefined) updateFields.qustodioEmail = body.qustodioEmail;
    if (body.qustodioPassword !== undefined)
      updateFields.qustodioPassword = body.qustodioPassword;
    if (body.plan !== undefined) {
      if (!["silver", "gold"].includes(body.plan)) {
        return NextResponse.json(
          { success: false, error: "plan must be silver or gold" },
          { status: 400 }
        );
      }
      updateFields.plan = body.plan;
    }
    if (body.isAssigned !== undefined) updateFields.isAssigned = Boolean(body.isAssigned);
    if (body.assignedToUser !== undefined)
      updateFields.assignedToUser = body.assignedToUser || null;
    if (body.assignedAt !== undefined)
      updateFields.assignedAt = body.assignedAt ? new Date(body.assignedAt).toISOString() : null;
    if (body.expiresAt !== undefined)
      updateFields.expiresAt = body.expiresAt ? new Date(body.expiresAt).toISOString() : null;
    if (body.purchasedFrom !== undefined)
      updateFields.purchasedFrom = body.purchasedFrom || null;
    if (body.notes !== undefined) updateFields.notes = body.notes || null;

    await db.update(licenses).set(updateFields).where(eq(licenses.id, id));

    const license = await db
      .select()
      .from(licenses)
      .where(eq(licenses.id, id))
      .get();

    return NextResponse.json({ success: true, data: license });
  } catch (error) {
    console.error("PUT /api/licenses/[id] error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update license" },
      { status: 500 }
    );
  }
}

// DELETE /api/licenses/[id] — delete license (only if not assigned)
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { db } = getCfContext();

    const license = await db
      .select()
      .from(licenses)
      .where(eq(licenses.id, id))
      .get();

    if (!license) {
      return NextResponse.json(
        { success: false, error: "License not found" },
        { status: 404 }
      );
    }

    if (license.isAssigned) {
      return NextResponse.json(
        { success: false, error: "Cannot delete an assigned license" },
        { status: 400 }
      );
    }

    await db.delete(licenses).where(eq(licenses.id, id));

    return NextResponse.json({ success: true, data: { id } });
  } catch (error) {
    console.error("DELETE /api/licenses/[id] error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete license" },
      { status: 500 }
    );
  }
}
