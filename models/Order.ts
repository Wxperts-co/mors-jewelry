import mongoose, { Schema, Document, Model } from "mongoose";

export interface IOrder extends Document {
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  item: string;
  totalAmount: number;
  status: "Processing" | "Shipped" | "Completed" | "Cancelled";
  createdAt: Date;
  updatedAt: Date;
}

const OrderSchema = new Schema<IOrder>(
  {
    orderNumber: { type: String, required: true, unique: true },
    customerName: { type: String, required: true, trim: true },
    customerEmail: { type: String, required: true, lowercase: true, trim: true },
    item: { type: String, required: true },
    totalAmount: { type: Number, required: true, default: 0 },
    status: {
      type: String,
      enum: ["Processing", "Shipped", "Completed", "Cancelled"],
      default: "Processing",
    },
  },
  { timestamps: true }
);

export const Order: Model<IOrder> =
  mongoose.models.Order || mongoose.model<IOrder>("Order", OrderSchema);

export default Order;
