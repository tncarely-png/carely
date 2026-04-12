import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const key = request.nextUrl.searchParams.get('key');

    if (!key) {
      return NextResponse.json(
        { error: 'المفتاح (key) مطلوب' },
        { status: 400 }
      );
    }

    const setting = await db.settings.findUnique({
      where: { key },
    });

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
    const body = await request.json();
    const { key, value } = body;

    if (!key || value === undefined || value === null) {
      return NextResponse.json(
        { error: 'المفتاح والقيمة مطلوبان' },
        { status: 400 }
      );
    }

    const setting = await db.settings.upsert({
      where: { key },
      create: { key, value: String(value) },
      update: { value: String(value) },
    });

    return NextResponse.json({ success: true, setting });
  } catch (error) {
    console.error('[settings] PUT Error:', error);
    return NextResponse.json(
      { error: 'فشل حفظ الإعداد' },
      { status: 500 }
    );
  }
}
