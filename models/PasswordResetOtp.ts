import mongoose, { Schema, Document, Model } from "mongoose";

export interface IPasswordResetOtp extends Document {
  email: string;
  otp: string;
  expiresAt: Date;
  createdAt: Date;
}

const PasswordResetOtpSchema = new Schema<IPasswordResetOtp>(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    otp: {
      type: String,
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: { expires: 0 }, // MongoDB automatic TTL cleanup
    },
  },
  {
    timestamps: true,
  }
);

export const PasswordResetOtp: Model<IPasswordResetOtp> =
  mongoose.models.PasswordResetOtp ||
  mongoose.model<IPasswordResetOtp>("PasswordResetOtp", PasswordResetOtpSchema);

export default PasswordResetOtp;
