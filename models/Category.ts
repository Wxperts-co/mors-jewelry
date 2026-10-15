import mongoose, { Schema, Document, Model } from "mongoose";

export interface ICategory extends Document {
  category_id?: string;
  parent_id?: string;
  category_name?: string;
  photourl?: string | null;
  alias?: string;
  activatedstatus?: string;
  name: string;
  slug: string;
  description: string;
  itemCount: number;
  created_at?: string;
  updated_at?: string;
  createdAt: Date;
  updatedAt: Date;
}

const CategorySchema = new Schema<ICategory>(
  {
    category_id: { type: String, index: true },
    parent_id: { type: String, default: "0" },
    category_name: { type: String, trim: true },
    photourl: { type: Schema.Types.Mixed, default: null },
    alias: { type: String, trim: true },
    activatedstatus: { type: String, default: "1" },
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, trim: true, lowercase: true },
    description: { type: String, default: "" },
    itemCount: { type: Number, default: 0 },
    created_at: { type: String, default: "" },
    updated_at: { type: String, default: "" },
  },
  { timestamps: true }
);

if (mongoose.models.Category) {
  delete mongoose.models.Category;
}

export const Category: Model<ICategory> =
  mongoose.models.Category || mongoose.model<ICategory>("Category", CategorySchema);

export default Category;
