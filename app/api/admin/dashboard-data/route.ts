import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Product } from "@/models/Product";
import { Category } from "@/models/Category";
import { Order } from "@/models/Order";
import { Admin } from "@/models/Admin";
import rawProductsData from "@/data/tbl_new_product.json";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    // 1. Check if products collection needs seeding or updating to match tbl_new_product.json
    const sampleRecord = await Product.findOne();
    const needsSync = !sampleRecord || !sampleRecord.msrp;

    if (needsSync && Array.isArray(rawProductsData) && rawProductsData.length > 0) {
      await Product.deleteMany({});
      const fullProducts = rawProductsData.map((item: any) => ({
        id: String(item.id),
        category_id: String(item.category_id || ''),
        keywords: item.keywords || '',
        sku: item.sku || `SKU-${item.id}`,
        title: item.title || '',
        alias: item.alias || '',
        alt_name: item.alt_name || '',
        size: item.size || '',
        description: item.description || '',
        msrp: String(item.msrp || '0.00'),
        wholesale_cost: String(item.wholesale_cost || '0.00'),
        ground_shipping: String(item.ground_shipping || '0.00'),
        '3_day_express': item['3_day_express'] || '',
        '2_day_express': item['2_day_express'] || '',
        next_day: item.next_day || '',
        available: item.available || 'Yes',
        seasonal_item: item.seasonal_item || 'No',
        color_options: item.color_options || '',
        gift_card_option: item.gift_card_option || '',
        actual_weight: String(item.actual_weight || ''),
        box_size_L_W_H: item.box_size_L_W_H || '',
        cubed_weight: String(item.cubed_weight || ''),
        available_for_postal_shipping: item.available_for_postal_shipping || null,
        perishable: item.perishable || 'No',
        thumb_image: item.thumb_image || '',
        large_image: item.large_image || '',
        featured: String(item.featured || '0'),
        new_arrival: String(item.new_arrival || '0'),
        best_seller: String(item.best_seller || '0'),
        status: String(item.status || '1'),
        created_at: item.created_at || '',
        updated_at: item.updated_at || '',
      }));

      await Product.insertMany(fullProducts);
    }

    // 2. Query real data from MongoDB Atlas
    const [products, categories, orders, admins] = await Promise.all([
      Product.find().sort({ createdAt: -1, _id: -1 }).lean(),
      Category.find().sort({ name: 1 }).lean(),
      Order.find().sort({ createdAt: -1, _id: -1 }).lean(),
      Admin.find().select("-password").sort({ createdAt: -1, _id: -1 }).lean(),
    ]);

    const totalRevenue = orders.reduce((acc, curr) => acc + (curr.totalAmount || 0), 0);

    return NextResponse.json({
      success: true,
      data: {
        products: products.map((p: any) => ({
          ...p,
          _id: p._id.toString(),
          id: p.id || p._id.toString(),
          sku: p.sku || '',
          title: p.title || '',
          alias: p.alias || '',
          alt_name: p.alt_name || '',
          category_id: p.category_id || '',
          size: p.size || '',
          msrp: p.msrp || '0.00',
          priceFormatted: `$${parseFloat(p.msrp || '0').toFixed(2)}`,
          wholesale_cost: p.wholesale_cost || '0.00',
          ground_shipping: p.ground_shipping || '0.00',
          available: p.available || 'Yes',
          seasonal_item: p.seasonal_item || 'No',
          featured: String(p.featured || '0'),
          new_arrival: String(p.new_arrival || '0'),
          best_seller: String(p.best_seller || '0'),
          status: String(p.status || '1'),
          thumb_image: p.thumb_image || '',
          large_image: p.large_image || '',
          actual_weight: p.actual_weight || '',
          box_size_L_W_H: p.box_size_L_W_H || '',
          cubed_weight: p.cubed_weight || '',
          keywords: p.keywords || '',
          description: p.description || '',
          created_at: p.created_at || (p.createdAt ? new Date(p.createdAt).toLocaleDateString() : ''),
          updated_at: p.updated_at || (p.updatedAt ? new Date(p.updatedAt).toLocaleDateString() : ''),
        })),
        categories: categories.map((c: any) => ({
          id: c._id.toString(),
          category_id: c.category_id || '',
          name: c.category_name || c.name,
          slug: c.alias || c.slug,
          desc: c.description || '',
          count: c.itemCount || 0,
        })),
        orders: orders.map((o: any) => ({
          id: o.orderNumber || o._id.toString().slice(-6).toUpperCase(),
          customer: o.customerName,
          email: o.customerEmail,
          item: o.item,
          amount: `$${Number(o.totalAmount).toLocaleString()}`,
          rawAmount: o.totalAmount,
          date: new Date(o.createdAt).toLocaleDateString(),
          status: o.status,
        })),
        admins: admins.map((a: any) => ({
          id: a._id.toString(),
          name: a.name || "Administrator",
          email: a.email,
          role: a.role || "admin",
          createdAt: new Date(a.createdAt).toLocaleDateString(),
        })),
        stats: {
          totalProducts: products.length,
          totalCategories: categories.length,
          totalOrders: orders.length,
          totalAdmins: admins.length,
          totalRevenue: `$${totalRevenue.toLocaleString()}`,
        },
      },
    });
  } catch (error: any) {
    console.error("Dashboard data fetch error:", error);
    return NextResponse.json(
      { success: false, message: error?.message || "Failed to retrieve dashboard records." },
      { status: 500 }
    );
  }
}
