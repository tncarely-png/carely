import { NextRequest, NextResponse } from 'next/server';
import { validateSuperAdminSession, createSuperAdminSession } from '@/lib/session';
import { getCfContext } from '@/lib/cf-context';
import { normalizeEmail, verifyAndConsumeChallenge } from '@/lib/email-otp-kv';

const SUPERADMIN_EMAIL = normalizeEmail(
  process.env.SUPERADMIN_EMAIL || 'admin@carely.tn'
);

/**
 * POST /api/superadmin-login
 * Body: { email: string, code: string } — code from email (Resend)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const emailNorm = normalizeEmail(typeof body.email === 'string' ? body.email : '');
    const code = typeof body.code === 'string' ? body.code.trim() : '';

    if (!emailNorm || !code) {
      return NextResponse.json(
        { success: false, error: 'البريد والكود مطلوبان' },
        { status: 400 }
      );
    }

    if (emailNorm !== SUPERADMIN_EMAIL) {
      return NextResponse.json(
        { success: false, error: 'بيانات الدخول غير صحيحة' },
        { status: 401 }
      );
    }

    if (code.length !== 6 || !/^\d{6}$/.test(code)) {
      return NextResponse.json(
        { success: false, error: 'أدخل الكود المكوّن من 6 أرقام' },
        { status: 400 }
      );
    }

    const { kv } = getCfContext();
    const ok = await verifyAndConsumeChallenge(kv, 'superadmin', emailNorm, code);
    if (!ok) {
      return NextResponse.json(
        { success: false, error: 'الكود غير صحيح أو منتهي' },
        { status: 401 }
      );
    }

    const token = await createSuperAdminSession(emailNorm);

    return NextResponse.json({
      success: true,
      token,
      email: emailNorm,
    });
  } catch {
    return NextResponse.json(
      { success: false, error: 'حدث خطأ في المخدم' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const token = request.headers.get('Authorization')?.replace('Bearer ', '');

  if (!token) {
    return NextResponse.json({ valid: false }, { status: 401 });
  }

  const session = await validateSuperAdminSession(token);
  if (!session) {
    return NextResponse.json({ valid: false }, { status: 401 });
  }

  return NextResponse.json({ valid: true, email: session.email });
}

export async function DELETE() {
  return NextResponse.json({ success: true });
}
