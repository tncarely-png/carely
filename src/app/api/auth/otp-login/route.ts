import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyIdToken, normalizePhoneForDb, extractDigits } from "@/lib/firebase-admin";

/**
 * POST /api/auth/otp-login
 * Body: { idToken: string, action?: "login" | "register", name?, address?, wilaya? }
 * 
 * IMPORTANT: Phone number comes from the Firebase token, NOT from the client body.
 * Firebase guarantees the phone is correct (E.164: "+21626107128") because it
 * sent the SMS and verified the OTP. The client cannot spoof this.
 * 
 * Flow:
 * 1. Verify the Firebase idToken server-side → get phone from token
 * 2. Normalize phone for DB lookup (handles E.164, digits, formatted)
 * 3. Login: find user → return user. Not found → isNewUser=true
 * 4. Register: create user with name/address/wilaya
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

    // ✅ Phone comes from Firebase token — guaranteed correct, E.164: "+21626107128"
    // We don't trust the client phone. Firebase sent the SMS and verified the OTP.
    const firebasePhone = firebaseUser.phoneNumber; // raw E.164 from Firebase
    const dbPhone = normalizePhoneForDb(firebasePhone); // formatted for DB: "+216 26 107 128"
    const digits = extractDigits(firebasePhone); // raw digits: "26107128"

    console.log("[otp-login] Firebase phone:", firebasePhone, "→ DB phone:", dbPhone);

    // ── LOGIN ──
    if (action === "login") {
      // Search by all possible phone formats stored in DB
      const user = await db.user.findFirst({
        where: {
          OR: [
            { phone: dbPhone },
            { phone: digits },
            { phone: firebasePhone },
          ],
        },
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

      // Check if user already exists (by any phone format)
      const existingUser = await db.user.findFirst({
        where: {
          OR: [
            { phone: dbPhone },
            { phone: digits },
            { phone: firebasePhone },
          ],
        },
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

      // Create new user — use normalized phone from Firebase token
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
