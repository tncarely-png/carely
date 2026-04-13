import { NextRequest, NextResponse } from 'next/server';
import { getCfContext } from '@/lib/cf-context';

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
    headers.set('access-control-allow-origin', '*');

    return new Response(object.body, { headers });
  } catch (error) {
    console.error('[upload GET] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch file' },
      { status: 500 }
    );
  }
}
