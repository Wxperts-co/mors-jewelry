import { NextRequest, NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/auth";
import fs from "fs/promises";
import path from "path";

export async function POST(req: NextRequest) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ success: false, message: "No file provided" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uploadsDir = path.join(process.cwd(), "public", "uploads", "products");
    await fs.mkdir(uploadsDir, { recursive: true });

    // Clean and create unique filename
    const ext = path.extname(file.name) || ".jpg";
    const cleanName = `${Date.now()}_${Math.random().toString(36).substring(2, 8)}${ext}`;
    const filePath = path.join(uploadsDir, cleanName);

    await fs.writeFile(filePath, buffer);

    const publicUrl = `/uploads/products/${cleanName}`;

    return NextResponse.json({
      success: true,
      url: publicUrl,
      fileName: cleanName,
    });
  } catch (error: any) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { success: false, message: error?.message || "Failed to upload file" },
      { status: 500 }
    );
  }
}
