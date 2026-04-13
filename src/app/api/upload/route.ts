import { NextRequest, NextResponse } from 'next/server';
import { getCfContext } from '@/lib/cf-context';

// POST /api/upload — upload image to R2
// Accepts FormData with a file field
// Returns the public URL of the uploaded file
export async function POST(request: NextRequest) {
  try {
    const { r2 } = getCfContext();
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'لم يتم إرسال ملف' },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { success: false, error: 'نوع الملف غير مدعوم. استخدم JPG, PNG, GIF, WebP أو SVG' },
        { status: 400 }
      );
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { success: false, error: 'حجم الملف كبير جداً. الحد الأقصى 5MB' },
        { status: 400 }
      );
    }

    // Generate unique key
    const ext = file.name.split('.').pop() || 'jpg';
    const key = `products/${Date.now()}-${crypto.randomUUID().slice(0, 8)}.${ext}`;

    // Upload to R2
    const buffer = await file.arrayBuffer();
    await r2.put(key, buffer, {
      httpMetadata: {
        contentType: file.type,
      },
    });

    // Return the URL that will be used to serve the file
    const url = `/api/upload/${key}`;

    return NextResponse.json({
      success: true,
      data: {
        url,
        key,
        name: file.name,
        size: file.size,
        type: file.type,
      },
    });
  } catch (error) {
    console.error('[upload POST] Error:', error);
    return NextResponse.json(
      { success: false, error: 'فشل رفع الملف' },
      { status: 500 }
    );
  }
}

// GET /api/upload/[...key] — serve image from R2
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ key: string[] }> }
) {
  try {
    const { key: keyParts } = await params;
    const key = keyParts.join('/');
    const { r2 } = getCfContext();

    const object = await r2.get(key);

    if (!object) {
      return NextResponse.json(
        { error: 'File not found' },
        { status: 404 }
      );
    }

    const headers = new Headers();
    object.writeHttpMetadata(headers);
    headers.set('cache-control', 'public, max-age=31536000, immutable');

    return new Response(object.body, { headers });
  } catch (error) {
    console.error('[upload GET] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch file' },
      { status: 500 }
    );
  }
}
