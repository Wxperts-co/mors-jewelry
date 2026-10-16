import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Category } from "@/models/Category";
import { getCurrentAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

// POST: Create a new category
export async function POST(req: NextRequest) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const body = await req.json();
    const { name, slug: providedSlug, description = "" } = body;

    if (!name || typeof name !== "string" || !name.trim()) {
      return NextResponse.json(
        { success: false, message: "Category name is required." },
        { status: 400 }
      );
    }

    const trimmedName = name.trim();
    const generatedSlug = (providedSlug || trimmedName)
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

    // Check if category name or slug already exists
    const existing = await Category.findOne({
      $or: [
        { name: new RegExp(`^${trimmedName}$`, "i") },
        { category_name: new RegExp(`^${trimmedName}$`, "i") },
        { slug: generatedSlug },
        { alias: generatedSlug },
      ],
    }).lean();

    if (existing) {
      return NextResponse.json(
        { success: false, message: `Category "${trimmedName}" or slug "${generatedSlug}" already exists.` },
        { status: 400 }
      );
    }

    // Determine next numeric category_id
    const allCategories = await Category.find({}, { category_id: 1 }).lean();
    let maxId = 0;
    for (const c of allCategories) {
      const num = parseInt(c.category_id || "0", 10);
      if (!isNaN(num) && num > maxId) {
        maxId = num;
      }
    }
    const nextCategoryId = String(maxId + 1);

    const newCategory = await Category.create({
      category_id: nextCategoryId,
      name: trimmedName,
      category_name: trimmedName,
      slug: generatedSlug,
      alias: generatedSlug,
      description: description.trim(),
      itemCount: 0,
      activatedstatus: "1",
    });

    return NextResponse.json({
      success: true,
      message: "Category created successfully.",
      category: {
        id: newCategory._id.toString(),
        category_id: newCategory.category_id,
        name: newCategory.name,
        slug: newCategory.slug,
        desc: newCategory.description,
        count: newCategory.itemCount || 0,
      },
    });
  } catch (error: any) {
    console.error("Category create error:", error);
    return NextResponse.json(
      { success: false, message: error?.message || "Failed to create category." },
      { status: 500 }
    );
  }
}

// PUT: Update an existing category
export async function PUT(req: NextRequest) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const body = await req.json();
    const { id, category_id, name, slug, description } = body;

    const query: any = {};
    if (id) query._id = id;
    else if (category_id) query.category_id = String(category_id);
    else {
      return NextResponse.json({ success: false, message: "Category ID is required." }, { status: 400 });
    }

    const updateFields: any = {};
    if (name) {
      updateFields.name = name.trim();
      updateFields.category_name = name.trim();
    }
    if (slug) {
      updateFields.slug = slug.toLowerCase().trim();
      updateFields.alias = slug.toLowerCase().trim();
    }
    if (description !== undefined) {
      updateFields.description = description.trim();
    }

    const updated = await Category.findOneAndUpdate(query, { $set: updateFields }, { new: true });
    if (!updated) {
      return NextResponse.json({ success: false, message: "Category not found." }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: "Category updated successfully.",
      category: {
        id: updated._id.toString(),
        category_id: updated.category_id,
        name: updated.name,
        slug: updated.slug,
        desc: updated.description,
        count: updated.itemCount || 0,
      },
    });
  } catch (error: any) {
    console.error("Category update error:", error);
    return NextResponse.json(
      { success: false, message: error?.message || "Failed to update category." },
      { status: 500 }
    );
  }
}

// DELETE: Delete a category
export async function DELETE(req: NextRequest) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const category_id = searchParams.get("category_id");

    const query: any = {};
    if (id) query._id = id;
    else if (category_id) query.category_id = String(category_id);
    else {
      return NextResponse.json({ success: false, message: "Category ID is required." }, { status: 400 });
    }

    const deleted = await Category.findOneAndDelete(query);
    if (!deleted) {
      return NextResponse.json({ success: false, message: "Category not found." }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Category deleted successfully." });
  } catch (error: any) {
    console.error("Category delete error:", error);
    return NextResponse.json(
      { success: false, message: error?.message || "Failed to delete category." },
      { status: 500 }
    );
  }
}
