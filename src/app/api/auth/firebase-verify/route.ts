import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

const FIREBASE_PROJECT_ID = "carely-9e601";
const FIREBASE_API_KEY = "AIzaSyANmsIKeIS2zHbbNuwn8L3ZgZxbanNYDUk";

/**
 * Verify a Firebase ID token by calling the Google Identity Toolkit API.
 * This validates the token server-side without needing the full Admin SDK.
 */
async function verifyIdToken(idToken: string): Promise<{
  uid: string;
  phoneNumber: string;
} | null> {
  try {
    const res = await fetch(
      `https://www.googleapis.com/identitytoolkit/v3/relyingparty/getAccountInfo?key=${FIREBASE_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken }),
      }
    );

    if (!res.ok) {
      console.error("Firebase token verification failed:", res.status);
      return null;
    }

    const data = await res.json();
    const users = data.users;

    if (!users || users.length === 0) return null;

    const user = users[0];
    if (!user.phoneNumber) {
      console.error("Firebase user has no phone number");
      return null;
    }

    return {
      uid: user.localId,
      phoneNumber: user.phoneNumber,
    };
  } catch (err) {
    console.error("Firebase verify error:", err);
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
// Body: { idToken, action: "login" | "register", name?, address?, wilaya? }
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

    // Verify Firebase token server-side
    const firebaseUser = await verifyIdToken(idToken);
    if (!firebaseUser) {
      return NextResponse.json(
        { success: false, error: "رمز التحقق غير صالح أو منتهي. أعد المحاولة." },
        { status: 401 }
      );
    }

    const firebasePhone = normalizePhone(firebaseUser.phoneNumber);

    // ── LOGIN ──
    if (action === "login") {
      const user = await db.user.findFirst({
        where: {
          OR: [
            { phone: firebasePhone },
            { phone: firebasePhone.replace(/[^\d]/g, "") },
          ],
        },
      });

      if (!user) {
        return NextResponse.json(
          {
            success: false,
            error: "ما لقينا حساب بهاد الرقم. سجل حساب جديد.",
            isNewUser: true,
          },
          { status: 404 }
        );
      }

      const { password: _, ...userWithoutPassword } = user;

      // Update Firebase UID
      await db.user.update({
        where: { id: user.id },
        data: { firebaseUid: firebaseUser.uid },
      });

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

      const existingUser = await db.user.findFirst({
        where: {
          OR: [
            { phone: firebasePhone },
            { phone: firebasePhone.replace(/[^\d]/g, "") },
          ],
        },
      });

      if (existingUser) {
        const { password: _, ...userWithoutPassword } = existingUser;
        return NextResponse.json(
          {
            success: false,
            error: "عندك حساب بهاد الرقم فعلا. سجل دخول.",
            user: userWithoutPassword,
            isExistingUser: true,
          },
          { status: 409 }
        );
      }

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
    console.error("Firebase verify error:", error);
    return NextResponse.json(
      { success: false, error: "حصل مشكل في المخدم. جرب مرة أخرى." },
      { status: 500 }
    );
  }
}
