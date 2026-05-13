import { NextRequest, NextResponse } from "next/server";
import { getCfContextAsync } from "@/lib/cf-context";
import { eq } from "drizzle-orm";
import { users } from "@/db/schema";
import { normalizePhoneForDb } from "@/lib/verify-firebase-token";
import { toAuthUser } from "@/lib/auth-user";
import { normalizeEmail } from "@/lib/email-otp-kv";
import {
  verifyAndConsumeChallengeDb,
  setRegisterPendingDb,
  hasRegisterPendingDb,
  clearRegisterPendingDb,
} from "@/lib/email-otp-db";

/**
 * POST /api/auth/otp-login
 * Body:
 *  - login: { email, code, action: "login" }
 *  - register: { email, action: "register", name, phone, address?, wilaya? }
 *    (after OTP verified once; register-pending KV flag must exist)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const action = body.action === "register" ? "register" : "login";
    const emailNorm = normalizeEmail(typeof body.email === "string" ? body.email : "");

    if (!emailNorm || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailNorm)) {
      return NextResponse.json(
        { success: false, error: "بريد إلكتروني غير صالح" },
        { status: 400 }
      );
    }

    const { db } = await getCfContextAsync();

    if (action === "login") {
      const code = typeof body.code === "string" ? body.code.trim() : "";
      if (code.length !== 6 || !/^\d{6}$/.test(code)) {
        return NextResponse.json(
          { success: false, error: "أدخل الكود المكوّن من 6 أرقام" },
          { status: 400 }
        );
      }

      const ok = await verifyAndConsumeChallengeDb(db, "customer", emailNorm, code);
      if (!ok) {
        return NextResponse.json(
          { success: false, error: "الكود غير صحيح أو منتهي" },
          { status: 401 }
        );
      }

      const user = await db.select().from(users).where(eq(users.email, emailNorm)).get();

      if (!user) {
        await setRegisterPendingDb(db, emailNorm);
        return NextResponse.json({
          success: false,
          isNewUser: true,
          error: "بريد جديد — أكمل بروفايلك",
        });
      }

      return NextResponse.json({
        success: true,
        user: toAuthUser(user),
      });
    }

    // ── REGISTER ──
    const name = typeof body.name === "string" ? body.name : "";
    const phoneRaw = typeof body.phone === "string" ? body.phone : "";
    const address = typeof body.address === "string" ? body.address : undefined;
    const wilaya = typeof body.wilaya === "string" ? body.wilaya : undefined;

    if (!name.trim()) {
      return NextResponse.json({ success: false, error: "الاسم لازم" }, { status: 400 });
    }

    const phoneDigits = phoneRaw.replace(/[^\d]/g, "");
    if (phoneDigits.length !== 8 || !/^[259]/.test(phoneDigits)) {
      return NextResponse.json(
        { success: false, error: "أدخل رقم هاتف تونسي صحيح (8 أرقام)" },
        { status: 400 }
      );
    }

    const pendingOk = await hasRegisterPendingDb(db, emailNorm);
    if (!pendingOk) {
      return NextResponse.json(
        { success: false, error: "انتهت جلسة التحقق. أعد إرسال الكود." },
        { status: 401 }
      );
    }

    const dbPhone = normalizePhoneForDb(phoneDigits);

    const existingEmail = await db.select().from(users).where(eq(users.email, emailNorm)).get();
    if (existingEmail) {
      await clearRegisterPendingDb(db, emailNorm);
      return NextResponse.json({ success: true, user: toAuthUser(existingEmail) });
    }

    const phoneTaken = await db.select().from(users).where(eq(users.phone, dbPhone)).get();
    if (phoneTaken) {
      return NextResponse.json(
        { success: false, error: "رقم الهاتف مسجّل بحساب آخر" },
        { status: 409 }
      );
    }

    const now = new Date().toISOString();
    const newUserId = crypto.randomUUID();

    await db.insert(users).values({
      id: newUserId,
      name: name.trim(),
      email: emailNorm,
      phone: dbPhone,
      address: address?.trim() || null,
      wilaya: wilaya?.trim() || null,
      role: "customer",
      createdAt: now,
      updatedAt: now,
    });

    await clearRegisterPendingDb(db, emailNorm);

    const newUser = await db.select().from(users).where(eq(users.id, newUserId)).get();

    console.log("[otp-login] New user:", newUser!.id, newUser!.email, newUser!.phone);

    return NextResponse.json({ success: true, user: toAuthUser(newUser!) }, { status: 201 });
  } catch (error) {
    console.error("[otp-login] Error:", error);
    return NextResponse.json(
      { success: false, error: "حصل مشكل في المخدم. جرب مرة أخرى." },
      { status: 500 }
    );
  }
}
