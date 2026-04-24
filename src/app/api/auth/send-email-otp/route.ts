import { NextRequest, NextResponse } from "next/server";
import { getCfContext } from "@/lib/cf-context";
import {
  normalizeEmail,
  randomOtpCode,
  hashOtp,
  putChallenge,
  checkSendRateLimit,
} from "@/lib/email-otp-kv";
import { sendOtpEmail } from "@/lib/resend-mail";

/**
 * POST /api/auth/send-email-otp
 * Body: { email: string }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const raw = typeof body.email === "string" ? body.email : "";
    const emailNorm = normalizeEmail(raw);

    if (!emailNorm || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailNorm)) {
      return NextResponse.json(
        { success: false, error: "أدخل بريداً إلكترونياً صحيحاً" },
        { status: 400 }
      );
    }

    const { kv } = getCfContext();

    const allowed = await checkSendRateLimit(kv, emailNorm);
    if (!allowed) {
      return NextResponse.json(
        { success: false, error: "انتظر قليلاً قبل طلب كود جديد" },
        { status: 429 }
      );
    }

    const code = randomOtpCode();
    const codeHash = await hashOtp(emailNorm, code);
    await putChallenge(kv, "customer", emailNorm, codeHash);

    const sent = await sendOtpEmail({ to: emailNorm, code });
    if (!sent.ok) {
      return NextResponse.json({ success: false, error: sent.error }, { status: 502 });
    }

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("[send-email-otp]", e);
    return NextResponse.json(
      { success: false, error: "حصل مشكل في المخدم" },
      { status: 500 }
    );
  }
}
