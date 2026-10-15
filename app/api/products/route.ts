import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Product } from "@/models/Product";
import { Category } from "@/models/Category";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const category = searchParams.get("category");
    const categoryId = searchParams.get("categoryId");
    const search = searchParams.get("search");

    // 1. Single product query
    if (id) {
      const product = await Product.findOne({
        $or: [{ id: String(id) }, { alias: String(id) }],
        status: { $ne: "0" },
      }).lean();

      if (!product) {
        return NextResponse.json(
          { success: false, message: "Product not found." },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        product: {
          ...product,
          id: String((product as any).id || (product as any)._id),
        },
      });
    }

    // 2. Build dynamic filter query
    const query: any = { status: { $ne: "0" } };

    if (categoryId) {
      query.category_id = String(categoryId);
    } else if (category && category.toLowerCase() !== "all") {
      // Find category by slug/alias/name in the DB
      const catDoc = await Category.findOne({
        $or: [
          { alias: new RegExp(`^${category}$`, "i") },
          { slug: new RegExp(`^${category}$`, "i") },
          { category_name: new RegExp(`^${category}$`, "i") },
          { name: new RegExp(`^${category}$`, "i") },
          { category_id: String(category) },
        ],
      }).lean();

      if (catDoc && catDoc.category_id) {
        query.category_id = String(catDoc.category_id);
      } else {
        // Fallback search by category term in title, keywords, or description
        query.$or = [
          { title: { $regex: category, $options: "i" } },
          { keywords: { $regex: category, $options: "i" } },
          { description: { $regex: category, $options: "i" } },
        ];
      }
    }

    if (search) {
      const searchRegex = { $regex: search, $options: "i" };
      query.$and = query.$and || [];
      query.$and.push({
        $or: [
          { title: searchRegex },
          { sku: searchRegex },
          { keywords: searchRegex },
          { description: searchRegex },
        ],
      });
    }

    const products = await Product.find(query).sort({ createdAt: -1, _id: -1 }).lean();

    return NextResponse.json({
      success: true,
      count: products.length,
      products: products.map((p: any) => ({
        id: String(p.id || p._id),
        category_id: String(p.category_id || ""),
        keywords: p.keywords || "",
        sku: p.sku || "",
        title: p.title || "",
        alias: p.alias || "",
        alt_name: p.alt_name || "",
        size: p.size || "",
        description: p.description || "",
        msrp: String(p.msrp || "0.00"),
        wholesale_cost: String(p.wholesale_cost || "0.00"),
        ground_shipping: String(p.ground_shipping || "0.00"),
        available: p.available || "Yes",
        thumb_image: p.thumb_image || "",
        large_image: p.large_image || "",
        featured: String(p.featured || "0"),
        new_arrival: String(p.new_arrival || "0"),
        best_seller: String(p.best_seller || "0"),
        status: String(p.status || "1"),
      })),
    });
  } catch (error: any) {
    console.error("Products API fetch error:", error);
    return NextResponse.json(
      { success: false, message: error?.message || "Failed to fetch products from database." },
      { status: 500 }
    );
  }
}
