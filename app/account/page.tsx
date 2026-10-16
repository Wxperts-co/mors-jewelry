import React from 'react';
import type { Metadata } from 'next';
import { getCurrentUser } from '@/lib/auth';
import { AccountClientWrapper } from '@/components/account/AccountClientWrapper';
import { connectDB } from '@/lib/mongodb';
import { User } from '@/models/User';

import { Order } from '@/models/Order';

export const metadata: Metadata = {
  title: "My Account | Mor's Jewelry & Repair",
  description: "View your order history, account details, and luxury shopping profile at Mor's Jewelry & Repair.",
};

export default async function AccountPage() {
  const tokenUser = await getCurrentUser();
  let initialUser = tokenUser;
  let initialOrders: any[] = [];

  if (tokenUser?.id) {
    try {
      await connectDB();
      const dbUser = await User.findById(tokenUser.id).select("-password").lean();
      if (dbUser) {
        initialUser = {
          id: (dbUser as any)._id.toString(),
          name: dbUser.name,
          email: dbUser.email,
          phone: (dbUser as any).phone || "",
          address: (dbUser as any).address || "",
        };
      }

      const userEmail = (dbUser?.email || tokenUser.email || "").trim().toLowerCase();
      const escapedEmail = userEmail.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const dbOrders = await Order.find({
        $or: [
          { userId: tokenUser.id },
          { customerEmail: userEmail },
          { customerEmail: { $regex: new RegExp(`^${escapedEmail}$`, "i") } },
        ],
      })
        .sort({ createdAt: -1 })
        .limit(30)
        .lean();

      initialOrders = dbOrders.map((o: any) => ({
        id: o._id.toString(),
        orderNumber: o.orderNumber,
        item: o.item,
        totalAmount: o.totalAmount,
        status: o.status,
        deliveryMethod: o.deliveryMethod || "shipping",
        createdAt: o.createdAt ? o.createdAt.toISOString() : "",
      }));
    } catch (e) {
      console.error("Failed to load fresh user/orders in AccountPage:", e);
    }
  }

  return <AccountClientWrapper initialUser={initialUser} initialOrders={initialOrders} />;
}
