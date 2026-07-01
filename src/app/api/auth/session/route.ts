import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getAuthUserForClerkSession } from "@/lib/clerk-d1";

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
        { success: false, error: "Session invalid: user not found" },
        { status: 401 }
      );
    }

    return NextResponse.json({ success: true, user });
  } catch (error) {
    console.error("Session check error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
