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

// GET /api/products/[id] — get single product
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { db } = getCfContext();

    const product = await db.select().from(products)
      .where(eq(products.id, id))
      .get();

    if (!product) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: parseProduct(product) });
  } catch (error) {
    console.error('[products GET by id] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch product' },
      { status: 500 }
    );
  }
}

// PUT /api/products/[id] — update product
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { db } = getCfContext();
    const body = await request.json();
    const {
      name, nameAr, slug, description, descriptionAr,
      emoji, imageUrl, price, priceLabel, features, landingSections,
      isActive, sortOrder, route, externalUrl,
    } = body;

    const existing = await db.select().from(products)
      .where(eq(products.id, id))
      .get();

    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      );
    }

    // Check slug uniqueness if changed
    if (slug && slug !== existing.slug) {
      const slugExists = await db.select().from(products)
        .where(eq(products.slug, slug))
        .get();
      if (slugExists) {
        return NextResponse.json(
          { success: false, error: 'منتج بنفس الرابط موجود بالفعل' },
          { status: 409 }
        );
      }
    }

    const updateFields: Record<string, unknown> = {
      updatedAt: new Date().toISOString(),
    };

    if (name !== undefined) updateFields.name = name;
    if (nameAr !== undefined) updateFields.nameAr = nameAr;
    if (slug !== undefined) updateFields.slug = slug;
    if (description !== undefined) updateFields.description = description || null;
    if (descriptionAr !== undefined) updateFields.descriptionAr = descriptionAr || null;
    if (emoji !== undefined) updateFields.emoji = emoji;
    if (imageUrl !== undefined) updateFields.imageUrl = imageUrl || null;
    if (price !== undefined) updateFields.price = price;
    if (priceLabel !== undefined) updateFields.priceLabel = priceLabel || null;
    if (features !== undefined) updateFields.features = features ? JSON.stringify(features) : null;
    if (landingSections !== undefined) updateFields.landingSections = landingSections ? JSON.stringify(landingSections) : null;
    if (isActive !== undefined) updateFields.isActive = isActive;
    if (sortOrder !== undefined) updateFields.sortOrder = sortOrder;
    if (route !== undefined) updateFields.route = route || null;
    if (externalUrl !== undefined) updateFields.externalUrl = externalUrl || null;

    await db.update(products).set(updateFields).where(eq(products.id, id));

    const updated = await db.select().from(products)
      .where(eq(products.id, id))
      .get();

    return NextResponse.json({
      success: true,
      data: updated ? parseProduct(updated) : null,
    });
  } catch (error) {
    console.error('[products PUT] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update product' },
      { status: 500 }
    );
  }
}

// DELETE /api/products/[id] — delete product
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { db } = getCfContext();

    const existing = await db.select().from(products)
      .where(eq(products.id, id))
      .get();

    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      );
    }

    // Delete image from R2 if exists
    if (existing.imageUrl) {
      try {
        const { r2 } = getCfContext();
        const key = existing.imageUrl.replace('/api/upload/', '');
        await r2.delete(key);
      } catch {
        // Non-critical
      }
    }

    await db.delete(products).where(eq(products.id, id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[products DELETE] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete product' },
      { status: 500 }
    );
  }
}
