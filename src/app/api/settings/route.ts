import { NextRequest, NextResponse } from 'next/server';
import { getCfContext } from '@/lib/cf-context';
import { eq } from 'drizzle-orm';
import { settings } from '@/db/schema';

export async function GET(request: NextRequest) {
  try {
    const { db } = getCfContext();
    const key = request.nextUrl.searchParams.get('key');

    if (!key) {
      return NextResponse.json(
        { error: 'المفتاح (key) مطلوب' },
        { status: 400 }
      );
    }

    const setting = await db.select().from(settings)
      .where(eq(settings.key, key))
      .get();

    if (!setting) {
      return NextResponse.json({ key, value: null });
    }

    return NextResponse.json(setting);
  } catch (error) {
    console.error('[settings] GET Error:', error);
    return NextResponse.json(
      { error: 'فشل تحميل الإعداد' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { db } = getCfContext();
    const body = await request.json();
    const { key, value } = body;

    if (!key || value === undefined || value === null) {
      return NextResponse.json(
        { error: 'المفتاح والقيمة مطلوبان' },
        { status: 400 }
      );
    }

    const now = new Date().toISOString();

    // Upsert: insert on conflict do update
    await db.insert(settings).values({
      key,
      value: String(value),
      createdAt: now,
      updatedAt: now,
    }).onConflictDoUpdate({
      target: settings.key,
      set: {
        value: String(value),
        updatedAt: now,
      },
    });

    return NextResponse.json({
      success: true,
      setting: { key, value: String(value), createdAt: now, updatedAt: now },
    });
  } catch (error) {
    console.error('[settings] PUT Error:', error);
    return NextResponse.json(
      { error: 'فشل حفظ الإعداد' },
      { status: 500 }
    );
  }
}
