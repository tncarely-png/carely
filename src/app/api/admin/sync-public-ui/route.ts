import { NextResponse } from "next/server";
import { getCfContext } from "@/lib/cf-context";
import { eq } from "drizzle-orm";
import { products } from "@/db/schema";
import { HERO_CONTENT, QSTUDIO_STORE_CARD } from "@/lib/store-content";

/**
 * POST — align production D1 product rows with code defaults (image_url, route).
 * Call once after deploy: POST /api/admin/sync-public-ui
 */
export async function POST() {
  try {
    const { db } = getCfContext();
    const now = new Date().toISOString();

    const rows = await db.select().from(products).all();
    let updated = 0;

    for (const row of rows) {
      const slug = (row.slug ?? "").toLowerCase();
      const route = (row.route ?? "").toLowerCase();
      if (
        slug === "qstudio" ||
        slug === "qustodio" ||
        route === "qstudio-app" ||
        route === "qustodio-app"
      ) {
        await db
          .update(products)
          .set({
            imageUrl: QSTUDIO_STORE_CARD.imageUrl,
            route: "qstudio-app",
            price: QSTUDIO_STORE_CARD.price,
            priceLabel: QSTUDIO_STORE_CARD.priceLabel,
            updatedAt: now,
          })
          .where(eq(products.id, row.id));
        updated += 1;
      }
    }

    return NextResponse.json({
      success: true,
      updated,
      heroNote:
        "Home hero text is from src/lib/store-content.ts (not D1 settings).",
    });
  } catch (error) {
    console.error("[sync-public-ui] Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to sync public UI" },
      { status: 500 }
    );
  }
}
