import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Category } from "@/models/Category";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    await connectDB();
    const categories = await Category.find({ activatedstatus: { $ne: "0" } })
      .sort({ category_id: 1, name: 1 })
      .lean();

    return NextResponse.json({
      success: true,
      categories: categories.map((c: any) => ({
        id: String(c.category_id || c._id),
        category_id: String(c.category_id || ""),
        name: c.category_name || c.name,
        slug: (c.alias || c.slug || c.name || c.category_name || "").toLowerCase(),
        itemCount: c.itemCount || 0,
      })),
    });
  } catch (error: any) {
    console.error("Categories API fetch error:", error);
    return NextResponse.json(
      { success: false, message: error?.message || "Failed to fetch categories from database." },
      { status: 500 }
    );
  }
}
