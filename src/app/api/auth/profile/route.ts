import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getCfContext } from "@/lib/cf-context";
import { eq } from "drizzle-orm";
import { users } from "@/db/schema";
import { toAuthUser } from "@/lib/auth-user";
import {
  assertClerkOwnsD1User,
  getAuthUserForClerkSession,
} from "@/lib/clerk-d1";

export async function GET() {
  try {
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) {
      return NextResponse.json(
        { success: false, error: "Not signed in" },
        { status: 401 }
      );
    }

    const user = await getAuthUserForClerkSession(clerkUserId);
    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, user });
  } catch (error) {
    console.error("Get profile error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) {
      return NextResponse.json(
        { success: false, error: "Not signed in" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { userId, name, phone, address, wilaya } = body;

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "userId is required" },
        { status: 400 }
      );
    }

    const owns = await assertClerkOwnsD1User(clerkUserId, userId);
    if (!owns) {
      return NextResponse.json(
        { success: false, error: "Forbidden" },
        { status: 403 }
      );
    }

    const { db } = getCfContext();

    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .get();

    if (!existingUser) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    const updateData: Record<string, string | null> = {};
    if (name !== undefined) updateData.name = name.trim();
    if (phone !== undefined) updateData.phone = phone?.trim() || null;
    if (address !== undefined) updateData.address = address?.trim() || null;
    if (wilaya !== undefined) updateData.wilaya = wilaya?.trim() || null;
    updateData.updatedAt = new Date().toISOString();

    await db.update(users).set(updateData).where(eq(users.id, userId));

    const user = await db.select().from(users).where(eq(users.id, userId)).get();

    return NextResponse.json({
      success: true,
      user: toAuthUser(user!),
    });
  } catch (error) {
    console.error("Update profile error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
