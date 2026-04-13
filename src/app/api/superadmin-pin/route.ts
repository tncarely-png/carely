import { NextRequest, NextResponse } from 'next/server';
import { getCfContext } from '@/lib/cf-context';

export async function POST(request: NextRequest) {
  try {
    const { pin } = await request.json();

    if (!pin || typeof pin !== 'string') {
      return NextResponse.json(
        { success: false, error: 'PIN مطلوب' },
        { status: 400 }
      );
    }

    const { env } = getCfContext();
    const validPin = (env as Record<string, string>).SUPERADMIN_PIN || '53577426';

    // Rate-limit check via KV
    const clientIp = request.headers.get('cf-connecting-ip') || 'unknown';
    const kv = (env as Record<string, unknown>)['carely-kv'] as import('@cloudflare/workers-types').KVNamespace;

    if (kv) {
      try {
        const attemptsKey = `sa_pin_attempts:${clientIp}`;
        const attempts = await kv.get(attemptsKey);
        if (attempts && parseInt(attempts) >= 5) {
          return NextResponse.json(
            { success: false, error: 'محاولات كثيرة. حاول بعد 15 دقيقة' },
            { status: 429 }
          );
        }

        if (pin !== validPin) {
          const current = attempts ? parseInt(attempts) : 0;
          await kv.put(attemptsKey, String(current + 1), { expirationTtl: 900 });
          return NextResponse.json(
            { success: false, error: 'PIN غير صحيح' },
            { status: 401 }
          );
        }

        // Clear attempts on success
        await kv.delete(attemptsKey);
      } catch {
        // KV failure — still validate PIN
        if (pin !== validPin) {
          return NextResponse.json(
            { success: false, error: 'PIN غير صحيح' },
            { status: 401 }
          );
        }
      }
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { success: false, error: 'حدث خطأ في المخدم' },
      { status: 500 }
    );
  }
}
