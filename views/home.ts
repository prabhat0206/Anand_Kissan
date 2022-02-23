import express from "express";
import { Product, Category, Brand } from "../database/productdb";
import { Coupon } from "../database/others";

const home = express.Router();

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
    category.products = products;
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
    brand.products = products;
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
    const coupon = await Coupon.findOne({ _id: req.query._id });
    return res.json({ Success: true, coupon: coupon });
  }
  const coupons = await Coupon.find();
  res.json({ Success: true, coupons: coupons });
});

export default home;
