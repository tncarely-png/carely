import { NextRequest, NextResponse } from "next/server";
import { getCfContextAsync, publicErrorMessage } from "@/lib/cf-context";
import {
  normalizeEmail,
  randomOtpCode,
  hashOtp,
} from "@/lib/email-otp-kv";
import { checkSendRateLimitDb, putChallengeDb } from "@/lib/email-otp-db";
import { sendOtpEmail } from "@/lib/resend-mail";

/**
 * POST /api/superadmin-send-otp
 * Body: { email: string }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const emailNorm = normalizeEmail(typeof body.email === "string" ? body.email : "");

    const { db, env: rawEnv } = await getCfContextAsync();
    const env = rawEnv as Record<string, unknown>;
    const expectedAdmin = normalizeEmail(
      (typeof env.SUPERADMIN_EMAIL === "string" && env.SUPERADMIN_EMAIL) || "admin@carely.tn"
    );

    if (emailNorm !== expectedAdmin) {
      return NextResponse.json(
        { success: false, error: "بيانات الدخول غير صحيحة" },
        { status: 401 }
      );
    }

    const allowed = await checkSendRateLimitDb(db, `sa:${emailNorm}`);
    if (!allowed) {
      return NextResponse.json(
        { success: false, error: "انتظر قليلاً قبل طلب كود جديد" },
        { status: 429 }
      );
    }

    const code = randomOtpCode();
    const codeHash = await hashOtp(emailNorm, code);
    await putChallengeDb(db, "superadmin", emailNorm, codeHash);

    const sent = await sendOtpEmail({
      to: emailNorm,
      code,
      subject: "كود الدخول — SuperAdmin Carely",
      cfEnv: env,
    });
    if (!sent.ok) {
      return NextResponse.json({ success: false, error: sent.error }, { status: 502 });
    }

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("[superadmin-send-otp]", e);
    const { ar, en, status } = publicErrorMessage(e);
    const payload: {
      success: false;
      error: string;
      errorEn: string;
      detail?: string;
    } = { success: false, error: ar, errorEn: en };
    if (process.env.NODE_ENV !== "production") {
      payload.detail = e instanceof Error ? e.message : String(e);
    }
    return NextResponse.json(payload, { status });
  }
}
