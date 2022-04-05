import mongoose from "./init";

const CouponSchema = new mongoose.Schema({
  coupon_id: String,
  percentage: String,
});

const NotificationSchema = new mongoose.Schema({
  uid: String,
  datetime: String,
  message: String,
});

const BannerSchema = new mongoose.Schema({
  url: String,
})

export const Coupon = mongoose.model("Coupon", CouponSchema);
export const Notification = mongoose.model("Notification", NotificationSchema);
export const Banner = mongoose.model("Banner", BannerSchema);