import { NextRequest, NextResponse } from 'next/server';
import { getCfContext } from '@/lib/cf-context';
import { eq } from 'drizzle-orm';
import { products } from '@/db/schema';

function parseProduct(p: Record<string, unknown>) {
  return {
    ...p,
    features: p.features ? JSON.parse(p.features as string) : [],
    landingSections: p.landingSections ? JSON.parse(p.landingSections as string) : [],
  };
}

// GET /api/products — list all products (active only by default)
export async function GET(request: NextRequest) {
  try {
    const { db } = getCfContext();
    const { searchParams } = new URL(request.url);
    const includeInactive = searchParams.get('all') === 'true';

    let query = db.select().from(products);
    if (!includeInactive) {
      query = query.where(eq(products.isActive, true)) as typeof query;
    }

    const result = await query.orderBy(products.sortOrder).all();
    const formatted = result.map(parseProduct);

    return NextResponse.json({ success: true, data: formatted });
  } catch (error) {
    console.error('[products GET] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}

// POST /api/products — create a new product
export async function POST(request: NextRequest) {
  try {
    const { db } = getCfContext();
    const body = await request.json();
    const {
      name, nameAr, slug, description, descriptionAr,
      emoji, imageUrl, price, priceLabel, features, landingSections,
      isActive, sortOrder, route, externalUrl,
    } = body;

    if (!name || !nameAr || !slug) {
      return NextResponse.json(
        { success: false, error: 'الاسم والاسم بالعربية والرابط مطلوبان' },
        { status: 400 }
      );
    }

    // Check for duplicate slug
    const existing = await db.select().from(products)
      .where(eq(products.slug, slug))
      .get();

    if (existing) {
      return NextResponse.json(
        { success: false, error: 'منتج بنفس الرابط موجود بالفعل' },
        { status: 409 }
      );
    }

    const now = new Date().toISOString();
    const id = crypto.randomUUID();

    await db.insert(products).values({
      id,
      name,
      nameAr,
      slug,
      description: description || null,
      descriptionAr: descriptionAr || null,
      emoji: emoji || '📦',
      imageUrl: imageUrl || null,
      price: price || 0,
      priceLabel: priceLabel || null,
      features: features ? JSON.stringify(features) : null,
      landingSections: landingSections ? JSON.stringify(landingSections) : null,
      isActive: isActive !== false,
      sortOrder: sortOrder || 0,
      route: route || null,
      externalUrl: externalUrl || null,
      createdAt: now,
      updatedAt: now,
    });

    const product = await db.select().from(products)
      .where(eq(products.id, id))
      .get();

    return NextResponse.json({
      success: true,
      data: product ? parseProduct(product) : null,
    }, { status: 201 });
  } catch (error) {
    console.error('[products POST] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create product' },
      { status: 500 }
    );
  }
}
