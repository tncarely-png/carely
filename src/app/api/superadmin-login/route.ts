import { NextRequest, NextResponse } from 'next/server';

// In-memory session store (resets on server restart — fine for single-instance)
const sessions = new Map<string, { email: string; createdAt: number }>();

const SUPERADMIN_EMAIL = process.env.SUPERADMIN_EMAIL || 'admin@carely.tn';
const SUPERADMIN_PASSWORD = process.env.SUPERADMIN_PASSWORD || 'carely2025';
const SESSION_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

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

    // Clean expired sessions
    const now = Date.now();
    for (const [token, session] of sessions.entries()) {
      if (now - session.createdAt > SESSION_TTL_MS) {
        sessions.delete(token);
      }
    }

    const token = `superadmin-session-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    sessions.set(token, { email, createdAt: now });

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

  const session = sessions.get(token);
  if (!session) {
    return NextResponse.json({ valid: false }, { status: 401 });
  }

  if (Date.now() - session.createdAt > SESSION_TTL_MS) {
    sessions.delete(token);
    return NextResponse.json({ valid: false }, { status: 401 });
  }

  return NextResponse.json({ valid: true, email: session.email });
}

export async function DELETE() {
  // No real logout endpoint needed — client just discards token
  return NextResponse.json({ success: true });
}
