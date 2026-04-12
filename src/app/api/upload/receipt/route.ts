import { getCfContext } from "@/lib/cf-context";

export async function POST(request: Request) {
  try {
    const { r2 } = getCfContext();

    const formData = await request.formData();
    const file = formData.get("receipt") as File;
    const orderId = formData.get("orderId") as string;

    if (!file) {
      return Response.json({ error: "No file uploaded" }, { status: 400 });
    }

    // Validate file type
    const allowed = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
    if (!allowed.includes(file.type)) {
      return Response.json({ error: "نوع الملف غير مدعوم" }, { status: 400 });
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return Response.json({ error: "حجم الملف كبير جداً (الحد الأقصى 10MB)" }, { status: 400 });
    }

    // Upload to R2
    const ext = file.name.split(".").pop() || "jpg";
    const key = `receipts/${orderId}-${Date.now()}.${ext}`;
    const buffer = await file.arrayBuffer();

    await r2.put(key, buffer, {
      httpMetadata: { contentType: file.type },
    });

    return Response.json({ success: true, url: key });
  } catch (error) {
    console.error("[upload/receipt] Error:", error);
    return Response.json({ error: "فشل رفع الملف" }, { status: 500 });
  }
}
