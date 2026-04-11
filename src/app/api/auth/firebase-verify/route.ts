import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// Firebase project config for token verification
const FIREBASE_PROJECT_ID = "carely-9e601";

/**
 * Decode a Firebase ID token (JWT) without the full Admin SDK.
 * Firebase ID tokens are signed JWTs issued after phone verification.
 * We decode and check the claims to verify the phone number.
 */
function decodeFirebaseToken(token: string): {
  uid: string;
  phoneNumber: string;
  exp: number;
  iat: number;
} | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;

    // Decode payload (base64url)
    const payload = JSON.parse(Buffer.from(parts[1], "base64url").toString("utf-8"));

    // Verify basic claims
    if (payload.iss !== `https://securetoken.google.com/${FIREBASE_PROJECT_ID}`) return null;
    if (payload.aud !== FIREBASE_PROJECT_ID) return null;
    if (payload.exp < Date.now() / 1000) return null;

    return {
      uid: payload.sub,
      phoneNumber: payload.phone_number || "",
      exp: payload.exp,
      iat: payload.iat,
    };
  } catch {
    return null;
  }
}

function normalizePhone(phone: string): string {
  let cleaned = phone.replace(/[^\d]/g, "");
  if (cleaned.length === 8 && /^[259]/.test(cleaned)) {
    return "+216 " + cleaned.slice(0, 2) + " " + cleaned.slice(2, 5) + " " + cleaned.slice(5, 8);
  }
  if (cleaned.length === 10 && cleaned.startsWith("216")) {
    const local = cleaned.slice(3);
    return "+216 " + local.slice(0, 2) + " " + local.slice(2, 5) + " " + local.slice(5, 8);
  }
  if (cleaned.startsWith("+216") && cleaned.length === 13) {
    const local = cleaned.slice(4);
    return "+216 " + local.slice(0, 2) + " " + local.slice(2, 5) + " " + local.slice(5, 8);
  }
  return phone;
}

// POST /api/auth/firebase-verify
// Body: { idToken: string, action: "login" | "register", name?: string, address?: string, wilaya?: string }
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { idToken, action, name, address, wilaya } = body;

    if (!idToken || !action) {
      return NextResponse.json(
        { success: false, error: "البيانات غير مكتملة" },
        { status: 400 }
      );
    }

    // Decode and verify Firebase token
    const decoded = decodeFirebaseToken(idToken);
    if (!decoded || !decoded.phoneNumber) {
      return NextResponse.json(
        { success: false, error: "رمز التحقق غير صالح أو منتهي. أعد المحاولة." },
        { status: 401 }
      );
    }

    const firebasePhone = normalizePhone(decoded.phoneNumber);

    // ── LOGIN ───────────────────────────────────
    if (action === "login") {
      const user = await db.user.findFirst({
        where: {
          OR: [{ phone: firebasePhone }, { phone: firebasePhone.replace(/[^\d]/g, "") }],
        },
      });

      if (!user) {
        return NextResponse.json(
          { success: false, error: "ما لقينا حساب بهاد الرقم. سجل حساب جديد.", isNewUser: true },
          { status: 404 }
        );
      }

      const { password: _, ...userWithoutPassword } = user;

      // Update Firebase UID if not set
      await db.user.update({
        where: { id: user.id },
        data: { firebaseUid: decoded.uid },
      });

      return NextResponse.json({
        success: true,
        user: { ...userWithoutPassword, firebaseUid: decoded.uid },
      });
    }

    // ── REGISTER ────────────────────────────────
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
          OR: [{ phone: firebasePhone }, { phone: firebasePhone.replace(/[^\d]/g, "") }],
        },
      });

      if (existingUser) {
        const { password: _, ...userWithoutPassword } = existingUser;
        return NextResponse.json(
          { success: false, error: "عندك حساب بهاد الرقم فعلا. سجل دخول.", user: userWithoutPassword, isExistingUser: true },
          { status: 409 }
        );
      }

      // Create new user
      const user = await db.user.create({
        data: {
          name: name.trim(),
          phone: firebasePhone,
          address: address?.trim() || null,
          wilaya: wilaya?.trim() || null,
          role: "customer",
          firebaseUid: decoded.uid,
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
    console.error("Firebase verify error:", error);
    return NextResponse.json(
      { success: false, error: "حصل مشكل في المخدم. جرب مرة أخرى." },
      { status: 500 }
    );
  }
}
