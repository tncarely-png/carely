import { NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { syncClerkUserToD1 } from "@/lib/clerk-d1";

export async function POST() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Not signed in" },
        { status: 401 }
      );
    }

    const clerkUser = await currentUser();
    if (!clerkUser) {
      return NextResponse.json(
        { success: false, error: "Clerk user not found" },
        { status: 401 }
      );
    }

    const user = await syncClerkUserToD1(clerkUser);

    return NextResponse.json({ success: true, user });
  } catch (error) {
    console.error("[clerk-sync] Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to sync user" },
      { status: 500 }
    );
  }
}
