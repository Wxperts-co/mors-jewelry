import mongoose, { Schema, Document, Model } from "mongoose";

export interface IProduct extends Document {
  id: string;
  category_id?: string;
  keywords?: string;
  sku: string;
  title: string;
  alias?: string;
  alt_name?: string;
  size?: string;
  description?: string;
  msrp: string;
  wholesale_cost?: string;
  ground_shipping?: string;
  "3_day_express"?: string;
  "2_day_express"?: string;
  next_day?: string;
  available?: string;
  seasonal_item?: string;
  color_options?: string;
  gift_card_option?: string;
  actual_weight?: string;
  box_size_L_W_H?: string;
  cubed_weight?: string;
  available_for_postal_shipping?: string | null;
  perishable?: string;
  thumb_image?: string;
  large_image?: string;
  featured?: string;
  new_arrival?: string;
  best_seller?: string;
  status?: string;
  created_at?: string;
  updated_at?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const ProductSchema = new Schema<IProduct>(
  {
    id: { type: String, index: true },
    category_id: { type: String, default: "" },
    keywords: { type: String, default: "" },
    sku: { type: String, required: true, trim: true },
    title: { type: String, required: true, trim: true },
    alias: { type: String, default: "" },
    alt_name: { type: String, default: "" },
    size: { type: String, default: "" },
    description: { type: String, default: "" },
    msrp: { type: String, required: true, default: "0.00" },
    wholesale_cost: { type: String, default: "0.00" },
    ground_shipping: { type: String, default: "0.00" },
    "3_day_express": { type: String, default: "" },
    "2_day_express": { type: String, default: "" },
    next_day: { type: String, default: "" },
    available: { type: String, default: "Yes" },
    seasonal_item: { type: String, default: "No" },
    color_options: { type: String, default: "" },
    gift_card_option: { type: String, default: "" },
    actual_weight: { type: String, default: "" },
    box_size_L_W_H: { type: String, default: "" },
    cubed_weight: { type: String, default: "" },
    available_for_postal_shipping: { type: Schema.Types.Mixed, default: null },
    perishable: { type: String, default: "No" },
    thumb_image: { type: String, default: "" },
    large_image: { type: String, default: "" },
    featured: { type: String, default: "0" },
    new_arrival: { type: String, default: "0" },
    best_seller: { type: String, default: "0" },
    status: { type: String, default: "1" },
    created_at: { type: String, default: "" },
    updated_at: { type: String, default: "" },
  },
  { timestamps: true }
);

if (mongoose.models.Product) {
  delete mongoose.models.Product;
}

export const Product: Model<IProduct> =
  mongoose.models.Product || mongoose.model<IProduct>("Product", ProductSchema);

export default Product;

