import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyIdToken, normalizePhoneForDb } from "@/lib/firebase-admin";

/**
 * POST /api/auth/otp-login
 * Body: { idToken: string, action?: "login" | "register", name?, address?, wilaya? }
 * 
 * IMPORTANT: Phone number comes from the Firebase token, NOT from the client body.
 * Firebase guarantees the phone is correct (E.164) because it sent the SMS and
 * verified the OTP. The client cannot spoof this.
 * 
 * All phones in DB are stored as: "+216 XX XXX XXXX" (consistent format)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { idToken, action = "login", name, address, wilaya } = body;

    if (!idToken) {
      return NextResponse.json(
        { success: false, error: "رمز التحقق غير موجود" },
        { status: 400 }
      );
    }

    // ── Verify Firebase token server-side ──
    const firebaseUser = await verifyIdToken(idToken);
    if (!firebaseUser) {
      return NextResponse.json(
        { success: false, error: "رمز التحقق غير صالح أو منتهي. أعد المحاولة." },
        { status: 401 }
      );
    }

    // Normalize Firebase phone to DB format: "+216 XX XXX XXXX"
    const dbPhone = normalizePhoneForDb(firebaseUser.phoneNumber);

    console.log("[otp-login] Firebase phone:", firebaseUser.phoneNumber, "→ DB phone:", dbPhone, "| action:", action);

    // ── LOGIN ──
    if (action === "login") {
      const user = await db.user.findFirst({
        where: { phone: dbPhone },
      });

      if (!user) {
        // New user — tell client to show profile form
        return NextResponse.json({
          success: false,
          isNewUser: true,
          error: "رقم جديد — أكمل بروفايلك",
        });
      }

      // Update Firebase UID
      await db.user.update({
        where: { id: user.id },
        data: { firebaseUid: firebaseUser.uid },
      });

      const { password: _, ...userWithoutPassword } = user;

      return NextResponse.json({
        success: true,
        user: { ...userWithoutPassword, firebaseUid: firebaseUser.uid },
      });
    }

    // ── REGISTER ──
    if (action === "register") {
      if (!name || !name.trim()) {
        return NextResponse.json(
          { success: false, error: "الاسم لازم" },
          { status: 400 }
        );
      }

      // Check if user already exists
      const existingUser = await db.user.findFirst({
        where: { phone: dbPhone },
      });

      if (existingUser) {
        // User already exists — log them in instead
        await db.user.update({
          where: { id: existingUser.id },
          data: { firebaseUid: firebaseUser.uid },
        });
        const { password: _, ...userWithoutPassword } = existingUser;
        return NextResponse.json({
          success: true,
          user: { ...userWithoutPassword, firebaseUid: firebaseUser.uid },
        });
      }

      // Create new user
      const user = await db.user.create({
        data: {
          name: name.trim(),
          phone: dbPhone,
          address: address?.trim() || null,
          wilaya: wilaya?.trim() || null,
          role: "customer",
          firebaseUid: firebaseUser.uid,
        },
      });

      const { password: _, ...userWithoutPassword } = user;

      console.log("[otp-login] New user created:", user.id, user.name, user.phone);

      return NextResponse.json(
        { success: true, user: userWithoutPassword },
        { status: 201 }
      );
    }

    return NextResponse.json(
      { success: false, error: "إجراء غير معروف" },
      { status: 400 }
    );
  } catch (error) {
    console.error("[otp-login] Error:", error);
    return NextResponse.json(
      { success: false, error: "حصل مشكل في المخدم. جرب مرة أخرى." },
      { status: 500 }
    );
  }
}
