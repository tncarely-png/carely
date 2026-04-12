import { NextRequest, NextResponse } from 'next/server';
import { validateSuperAdminSession, createSuperAdminSession } from '@/lib/session';

const SUPERADMIN_EMAIL = process.env.SUPERADMIN_EMAIL || 'admin@carely.tn';
const SUPERADMIN_PASSWORD = process.env.SUPERADMIN_PASSWORD || 'carely2025';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'البريد وكلمة المرور مطلوبان' },
        { status: 400 }
      );
    }

    if (email !== SUPERADMIN_EMAIL || password !== SUPERADMIN_PASSWORD) {
      return NextResponse.json(
        { success: false, error: 'بيانات الدخول غير صحيحة' },
        { status: 401 }
      );
    }

    const token = await createSuperAdminSession(email);

    return NextResponse.json({
      success: true,
      token,
      email,
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
  // Client discards token — KV handles auto-expiry
  return NextResponse.json({ success: true });
}
