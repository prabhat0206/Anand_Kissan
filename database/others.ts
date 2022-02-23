import mongoose from "./init";

const CouponSchema = new mongoose.Schema({
  coupon_id: String,
  percentage: String,
});

export const Coupon = mongoose.model("Coupon", CouponSchema);
