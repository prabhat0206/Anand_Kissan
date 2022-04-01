import mongoose from "./init";

const UserSchema = new mongoose.Schema({
  uid: String,
  name: String,
  ph_number: String,
  last_otp: String,
  token: String,
  cart: [
    {
      _id: String,
      quantity: Number,
    },
  ],
  wishlist: [String],
});

const AddressSchema = new mongoose.Schema({
  uid: String,
  name: String,
  address_1: String,
  address_2: String,
  city: String,
  phone: String,
  state: String,
  pin_code: Number,
  country: String,
});

const OrderSchema = new mongoose.Schema({
  uid: String,
  date: String,
  payment_id: String,
  order_id: String,
  address: {
    name: String,
    address_1: String,
    address_2: String,
    city: String,
    phone: String,
    state: String,
    pin_code: Number,
    country: String,
  },
  total_amount: Number,
  status: String,
  token: String,
  payment_method: String,
  coupon_id: String,
  products: [
    {
      _id: String,
      name: String,
      image_url: String,
      price: String,
      quantity: Number,
    },
  ],
});

export const User = mongoose.model("User", UserSchema);
export const Address = mongoose.model("Address", AddressSchema);
export const Order = mongoose.model("Order", OrderSchema);
