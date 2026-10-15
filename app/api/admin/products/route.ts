import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Product } from "@/models/Product";
import { getCurrentAdmin } from "@/lib/auth";

// POST: Create a new product
export async function POST(req: NextRequest) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const body = await req.json();
    const {
      title,
      msrp,
      category_id,
      sku,
      description,
      size,
      wholesale_cost,
      available = 'Yes',
      featured = '0',
      new_arrival = '0',
      best_seller = '0',
    } = body;

    if (!title || !msrp) {
      return NextResponse.json(
        { success: false, message: "Product title and MSRP price are required." },
        { status: 400 }
      );
    }

    // Auto-generate numeric ID based on highest existing ID
    const latestProduct = await Product.findOne().sort({ createdAt: -1 }).lean();
    const nextId = String(Date.now()).slice(-6);
    const finalId = body.id || nextId;
    const finalSku = sku || `SKU-${finalId}`;

    const newProduct = await Product.create({
      id: finalId,
      title,
      msrp: String(msrp),
      category_id: String(category_id || '1'),
      sku: finalSku,
      description: description || '',
      size: size || '',
      wholesale_cost: wholesale_cost ? String(wholesale_cost) : '0.00',
      available: available || 'Yes',
      featured: String(featured || '0'),
      new_arrival: String(new_arrival || '0'),
      best_seller: String(best_seller || '0'),
      status: '1',
      thumb_image: body.thumb_image || '',
      large_image: body.large_image || '',
    });

    return NextResponse.json({
      success: true,
      message: "Product created successfully.",
      product: {
        ...newProduct.toObject(),
        _id: newProduct._id.toString(),
        priceFormatted: `$${parseFloat(newProduct.msrp || '0').toFixed(2)}`,
      },
    });
  } catch (error: any) {
    console.error("Product create error:", error);
    return NextResponse.json(
      { success: false, message: error?.message || "Failed to create product." },
      { status: 500 }
    );
  }
}

// PUT: Update an existing product
export async function PUT(req: NextRequest) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const body = await req.json();
    const { id, title, msrp, wholesale_cost, available, size, description, category_id } = body;

    if (!id) {
      return NextResponse.json({ success: false, message: "Product ID is required." }, { status: 400 });
    }

    const updated = await Product.findOneAndUpdate(
      { id: String(id) },
      {
        $set: {
          ...(title !== undefined && { title }),
          ...(msrp !== undefined && { msrp: String(msrp) }),
          ...(wholesale_cost !== undefined && { wholesale_cost: String(wholesale_cost) }),
          ...(available !== undefined && { available }),
          ...(size !== undefined && { size }),
          ...(description !== undefined && { description }),
          ...(category_id !== undefined && { category_id: String(category_id) }),
          ...(body.thumb_image !== undefined && { thumb_image: body.thumb_image }),
          ...(body.large_image !== undefined && { large_image: body.large_image }),
        },
      },
      { new: true }
    );

    if (!updated) {
      return NextResponse.json({ success: false, message: "Product not found." }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Product updated successfully.", product: updated });
  } catch (error: any) {
    console.error("Product update error:", error);
    return NextResponse.json({ success: false, message: error?.message || "Failed to update product." }, { status: 500 });
  }
}

// DELETE: Delete a product by ID
export async function DELETE(req: NextRequest) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ success: false, message: "Product ID is required." }, { status: 400 });
    }

    const deleted = await Product.findOneAndDelete({ id: String(id) });
    if (!deleted) {
      return NextResponse.json({ success: false, message: "Product not found." }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Product deleted successfully." });
  } catch (error: any) {
    console.error("Product delete error:", error);
    return NextResponse.json({ success: false, message: error?.message || "Failed to delete product." }, { status: 500 });
  }
}
