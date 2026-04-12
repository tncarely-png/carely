import { NextRequest, NextResponse } from "next/server";
import { getCfContext } from "@/lib/cf-context";
import { eq, and, desc } from "drizzle-orm";
import { licenses, subscriptions, users } from "@/db/schema";

// GET /api/licenses — list all licenses with optional filters
export async function GET(request: NextRequest) {
  try {
    const { db } = getCfContext();
    const { searchParams } = new URL(request.url);
    const plan = searchParams.get("plan");
    const isAssigned = searchParams.get("isAssigned");

    const conditions = [];
    if (plan) conditions.push(eq(licenses.plan, plan));
    if (isAssigned !== null) {
      conditions.push(eq(licenses.isAssigned, isAssigned === "true"));
    }

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
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(licenses.createdAt))
      .all();

    // Group by license ID and flatten
    const licenseMap = new Map<string, {
      license: typeof result[0]["license"];
      assignedUserName: string | null;
      assignedUserEmail: string | null;
    }>();

    for (const row of result) {
      if (!licenseMap.has(row.license.id)) {
        licenseMap.set(row.license.id, {
          license: row.license,
          assignedUserName: null,
          assignedUserEmail: null,
        });
      }
      // Take the first subscription user info found
      const entry = licenseMap.get(row.license.id)!;
      if (!entry.assignedUserName && row.userName) {
        entry.assignedUserName = row.userName;
        entry.assignedUserEmail = row.userEmail;
      }
    }

    const formattedLicenses = Array.from(licenseMap.values()).map(
      ({ license, assignedUserName, assignedUserEmail }) => ({
        ...license,
        assignedUserName,
        assignedUserEmail,
      })
    );

    return NextResponse.json({ success: true, data: formattedLicenses });
  } catch (error) {
    console.error("GET /api/licenses error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch licenses" },
      { status: 500 }
    );
  }
}

// POST /api/licenses — create a new license
export async function POST(request: NextRequest) {
  try {
    const { db } = getCfContext();
    const body = await request.json();
    const { qustodioEmail, qustodioPassword, plan, expiresAt, purchasedFrom, notes } = body;

    if (!qustodioEmail || !qustodioPassword) {
      return NextResponse.json(
        { success: false, error: "qustodioEmail and qustodioPassword are required" },
        { status: 400 }
      );
    }

    if (plan && !["silver", "gold"].includes(plan)) {
      return NextResponse.json(
        { success: false, error: "plan must be silver or gold" },
        { status: 400 }
      );
    }

    // Check for duplicate email
    const existing = await db
      .select()
      .from(licenses)
      .where(eq(licenses.qustodioEmail, qustodioEmail))
      .get();

    if (existing) {
      return NextResponse.json(
        { success: false, error: "A license with this qustodioEmail already exists" },
        { status: 409 }
      );
    }

    const now = new Date().toISOString();
    const id = crypto.randomUUID();

    await db.insert(licenses).values({
      id,
      qustodioEmail,
      qustodioPassword,
      plan: plan || "silver",
      expiresAt: expiresAt ? new Date(expiresAt).toISOString() : null,
      purchasedFrom: purchasedFrom || null,
      notes: notes || null,
      createdAt: now,
      updatedAt: now,
    });

    const license = await db
      .select()
      .from(licenses)
      .where(eq(licenses.id, id))
      .get();

    return NextResponse.json({ success: true, data: license }, { status: 201 });
  } catch (error) {
    console.error("POST /api/licenses error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create license" },
      { status: 500 }
    );
  }
}
