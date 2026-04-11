import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyIdToken, normalizePhoneForDb, extractDigits } from "@/lib/firebase-admin";

/**
 * POST /api/auth/otp-login
 * Body: { phone: string, idToken: string, action?: "login" | "register", name?, address?, wilaya? }
 * 
 * Flow:
 * 1. Verify the Firebase idToken server-side (cryptographic verification)
 * 2. Match the phone number against the DB
 * 3. If login: find user, update Firebase UID, return user
 * 4. If register: create user with provided name/address/wilaya
 * 5. If phone not found on login: return isNewUser=true so client shows profile form
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { phone, idToken, action = "login", name, address, wilaya } = body;

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

    // Firebase returns phone in E.164: "+21626107128"
    const firebasePhone = normalizePhoneForDb(firebaseUser.phoneNumber);
    const firebaseDigits = extractDigits(firebaseUser.phoneNumber);
    const clientDigits = extractDigits(phone || "");

    // Verify phone match (optional extra security: check client phone matches Firebase phone)
    if (clientDigits.length === 8 && firebaseDigits !== clientDigits) {
      console.warn("[otp-login] Phone mismatch: client=", clientDigits, "firebase=", firebaseDigits);
      return NextResponse.json(
        { success: false, error: "رقم الهاتف لا يتطابق مع الرقم المُتحقق منه" },
        { status: 400 }
      );
    }

    // ── LOGIN ──
    if (action === "login") {
      const user = await db.user.findFirst({
        where: {
          OR: [
            { phone: firebasePhone },
            { phone: firebaseDigits },
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

      // Check if user already exists
      const existingUser = await db.user.findFirst({
        where: {
          OR: [
            { phone: firebasePhone },
            { phone: firebaseDigits },
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

      // Create new user
      const user = await db.user.create({
        data: {
          name: name.trim(),
          phone: firebasePhone,
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
