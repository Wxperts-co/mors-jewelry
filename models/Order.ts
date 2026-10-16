import mongoose, { Schema, Document, Model } from "mongoose";

export interface IOrderItem {
  id: string;
  title: string;
  price: number | string;
  quantity: number;
  image?: string;
  category?: string;
}

export interface IShippingAddress {
  address: string;
  apartment?: string;
  city: string;
  state: string;
  zipCode: string;
}

export interface IOrder extends Document {
  orderNumber: string;
  userId?: string;
  customerName: string;
  customerEmail: string;
  phone?: string;
  deliveryMethod?: "shipping" | "pickup";
  shippingAddress?: IShippingAddress;
  items?: IOrderItem[];
  item: string;
  subtotal?: number;
  shippingCost?: number;
  tax?: number;
  totalAmount: number;
  notes?: string;
  status: "Processing" | "Shipped" | "Delivered" | "Completed" | "Cancelled";
  createdAt: Date;
  updatedAt: Date;
}

const OrderSchema = new Schema<IOrder>(
  {
    orderNumber: { type: String, required: true, unique: true },
    userId: { type: String, default: "", index: true },
    customerName: { type: String, required: true, trim: true },
    customerEmail: { type: String, required: true, lowercase: true, trim: true },
    phone: { type: String, default: "" },
    deliveryMethod: { type: String, default: "shipping" },
    shippingAddress: {
      address: { type: String, default: "" },
      apartment: { type: String, default: "" },
      city: { type: String, default: "" },
      state: { type: String, default: "" },
      zipCode: { type: String, default: "" },
    },
    items: { type: [Schema.Types.Mixed], default: [] },
    item: { type: String, required: true },
    subtotal: { type: Number, default: 0 },
    shippingCost: { type: Number, default: 0 },
    tax: { type: Number, default: 0 },
    totalAmount: { type: Number, required: true, default: 0 },
    notes: { type: String, default: "" },
    status: {
      type: String,
      enum: ["Processing", "Shipped", "Delivered", "Completed", "Cancelled"],
      default: "Processing",
    },
  },
  { timestamps: true, strict: false }
);

if (mongoose.models.Order) {
  delete mongoose.models.Order;
}

export const Order: Model<IOrder> =
  mongoose.models.Order || mongoose.model<IOrder>("Order", OrderSchema);

export default Order;
