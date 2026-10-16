import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Product } from "@/models/Product";
import { Category } from "@/models/Category";
import { Order } from "@/models/Order";
import { Admin } from "@/models/Admin";
import { User } from "@/models/User";
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
    const [products, categories, orders, admins, users] = await Promise.all([
      Product.find().sort({ createdAt: -1, _id: -1 }).lean(),
      Category.find().sort({ name: 1 }).lean(),
      Order.find().sort({ createdAt: -1, _id: -1 }).lean(),
      Admin.find().select("-password").sort({ createdAt: -1, _id: -1 }).lean(),
      User.find().select("-password").sort({ createdAt: -1, _id: -1 }).lean(),
    ]);

    const totalRevenue = orders.reduce((acc, curr) => acc + (curr.totalAmount || 0), 0);

    // Map order counts and spend by customer
    const customerStats: Record<string, { count: number; total: number }> = {};
    orders.forEach((o: any) => {
      const email = (o.customerEmail || "").toLowerCase().trim();
      const uid = o.userId ? String(o.userId) : "";
      const amt = Number(o.totalAmount || 0);
      if (email) {
        if (!customerStats[email]) customerStats[email] = { count: 0, total: 0 };
        customerStats[email].count += 1;
        customerStats[email].total += amt;
      }
      if (uid) {
        if (!customerStats[uid]) customerStats[uid] = { count: 0, total: 0 };
        customerStats[uid].count += 1;
        customerStats[uid].total += amt;
      }
    });

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
          orderNumber: o.orderNumber || o._id.toString().slice(-6).toUpperCase(),
          customer: o.customerName,
          email: o.customerEmail,
          phone: o.phone || "",
          deliveryMethod: o.deliveryMethod || "shipping",
          shippingAddress: o.shippingAddress || null,
          items: o.items || [],
          item: o.item || "Jewelry Item",
          amount: `$${Number(o.totalAmount || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
          rawAmount: o.totalAmount || 0,
          subtotal: o.subtotal || 0,
          shippingCost: o.shippingCost || 0,
          tax: o.tax || 0,
          totalAmount: o.totalAmount || 0,
          date: o.createdAt ? new Date(o.createdAt).toLocaleDateString() : "",
          status: o.status || "Processing",
          notes: o.notes || "",
        })),
        admins: admins.map((a: any) => ({
          id: a._id.toString(),
          name: a.name || "Administrator",
          email: a.email,
          role: a.role || "admin",
          createdAt: new Date(a.createdAt).toLocaleDateString(),
        })),
        users: users.map((u: any) => {
          const email = (u.email || "").toLowerCase().trim();
          const uid = u._id.toString();
          const stats = customerStats[uid] || customerStats[email] || { count: 0, total: 0 };
          return {
            id: uid,
            _id: uid,
            name: u.name || "Customer",
            email: u.email,
            phone: u.phone || "-",
            address: u.address || "-",
            ordersCount: stats.count,
            totalSpent: stats.total,
            totalSpentFormatted: `$${Number(stats.total).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
            role: "Customer",
            createdAt: u.createdAt ? new Date(u.createdAt).toLocaleDateString() : "",
          };
        }),
        stats: {
          totalProducts: products.length,
          totalCategories: categories.length,
          totalOrders: orders.length,
          totalAdmins: admins.length,
          totalUsers: users.length,
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
