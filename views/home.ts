import express from "express";
import { Product, Category, Brand } from "../database/productdb";
import { Coupon } from "../database/others";
import Razorpay from "razorpay";
import dotenv from "dotenv";

dotenv.config();
export const payment = new Razorpay({
  key_id: process.env.RZ_KEY,
  key_secret: process.env.RZ_SECRET,
});

const home = express.Router();

home.get("/payment", async (req, res) => {
  const amount = Number(req.query.amount) * 100;
  const options = {
    amount: amount,
    currency: "INR",
    receipt: "order_rcptid_11",
  };
  const order_id = await payment.orders.create(options);
  res.json({
    Success: true,
    order_id: order_id,
  });
});

home.get("/product", async (req: express.Request, res: express.Response) => {
  // single product view
  if (req.query._id) {
    const product = await Product.findOne({ _id: req.query._id });
    return res.json({
      Success: true,
      product_details: product,
    });
  }

  const trending = await Product.find({
    isTopSelling: true,
  }).sort({
    product_id: -1,
  });

  const featured = await Product.find({
    isFeatured: true,
  }).sort({
    product_id: -1,
  });

  const most_selling = await Product.find({
    isMostSelling: true,
  }).sort({
    product_id: -1,
  });

  const all_others = await Product.find().sort({
    product_id: -1,
  });

  res.json({
    Success: true,
    trending: trending,
    featured: featured,
    most_selling: most_selling,
    all_others: all_others,
  });
});

home.get("/categories", async (req: express.Request, res: express.Response) => {
  if (req.query._id) {
    let category = await Category.findOne({ _id: req.query._id });
    const products = await Product.find({ category: req.query._id }).sort({
      _id: -1,
    });
    category = { category: category, products: products };
    return res.json({ Success: true, category: category });
  }
  const categories = await Category.find();
  res.json({
    Success: true,
    categories: categories,
  });
});

home.get("/brand", async (req: express.Request, res: express.Response) => {
  if (req.query._id) {
    let brand = await Brand.findOne({ _id: req.query._id });
    const products = await Product.find({ brand: req.query._id }).sort({
      _id: -1,
    });
    brand = { brand: brand, product: products };
    return res.json({ Success: true, category: brand });
  }

  const brands = await Brand.find();
  res.json({
    Success: true,
    brands: brands,
  });
});

home.get("/coupon", async (req, res) => {
  if (req.query._id) {
    const coupon = await Coupon.findOne({ coupon_id: req.query._id });
    return res.json({ Success: true, coupon: coupon });
  }
  const coupons = await Coupon.find();
  res.json({ Success: true, coupons: coupons });
});

home.get("/search", async (req, res) => {
  const key = req.query.q || "none";
  const products = await Product.find({ $text: { $search: key.toString() } });
  res.json({ Success: true, products: products });
});

export default home;
