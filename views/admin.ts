import express from "express";
import { Product, Category, Brand } from "../database/productdb";
import { User, Order } from "../database/userdb";
import { Coupon, Notification, Banner } from "../database/others";

const admin = express.Router();

const checkAdmin = (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  const token = req.headers.authorization?.replace("Basic ", "");
  if (token) {
    const admin_token = btoa(
      `${process.env.ADMIN_EMAIL}:${process.env.ADMIN_PASSWORD}`
    );
    if (admin_token === token) {
      next();
    } else {
      res.sendStatus(401);
    }
  } else {
    res.sendStatus(401);
  }
};

admin.get("/status/:status", async (req, res) => {
  const status = req.params.status.toLowerCase();
  const orders = await Order.find({
    status: status,
  }).sort({ _id: -1 });
  res.json({
    Success: true,
    orders: orders,
  });
});

admin.get("/products", async (req, res) => {
  const products = await Product.find({ category: req.query.id }).sort({
    _id: -1,
  });
  return res.json({ Success: true, products: products });
});

admin
  .route("/category")
  .get(async (req, res) => {
    if (req.query._id) {
      const category = await Category.findOne({ _id: req.query._id });
      return res.json({ Success: true, category: category });
    }
    const categories = await Category.find().sort({ _id: -1 });
    res.json({ Success: true, categories: categories });
  })
  .post(checkAdmin, async (req, res) => {
    await Category.create(req.body);
    res.json({ Success: true });
  })
  .put(checkAdmin, async (req, res) => {
    const id = req.body._id;
    let dataToUpdate = req.body;
    delete dataToUpdate._id;
    await Category.findOneAndUpdate({ _id: id }, dataToUpdate);
    res.json({ Success: true });
  })
  .delete(checkAdmin, async (req, res) => {
    await Category.deleteOne({ _id: req.query._id });
    await Product.deleteMany({ category: req.query._id })
    res.json({ Success: true });
  });

admin
  .route("/brand")
  .get(async (req, res) => {
    if (req.query._id) {
      const brand = await Brand.findOne({ _id: req.query._id });
      return res.json({ Success: true, brand: brand });
    }
    const brands = await Brand.find().sort({ _id: -1 });
    res.json({ Success: true, barnds: brands });
  })
  .post(checkAdmin, async (req, res) => {
    await Brand.create(req.body);
    res.json({ Success: true });
  })
  .put(checkAdmin, async (req, res) => {
    const id = req.body._id;
    let dataToUpdate = req.body;
    delete dataToUpdate._id;
    await Brand.findOneAndUpdate({ _id: id }, dataToUpdate);
    res.json({ Success: true });
  })
  .delete(checkAdmin, async (req, res) => {
    await Brand.deleteOne({ _id: req.query._id });
    res.json({ Success: true });
  });

admin
  .route("/product")
  .get(async (req, res) => {
    if (req.query._id) {
      const product = await Product.findOne({ _id: req.query._id });
      return res.json({ Success: true, product: product });
    }
    const products = await Product.find().sort({ _id: -1 });
    res.json({ Success: true, products: products });
  })
  .post(checkAdmin, async (req, res) => {
    await Product.create(req.body);
    res.json({ Success: true });
  })
  .put(checkAdmin, async (req, res) => {
    const id = req.body._id;
    let dataToUpdate = req.body;
    delete dataToUpdate._id;
    await Product.findOneAndUpdate({ _id: id }, dataToUpdate);
    res.json({ Success: true });
  })
  .delete(checkAdmin, async (req, res) => {
    await Product.deleteOne({ _id: req.query._id });
    res.json({ Success: true });
  });

admin.get("/users", checkAdmin, async (req, res) => {
  const users = await User.find({}, { cart: 0, wishlist: 0 }).sort({
    _id: -1,
  });
  res.json({ Success: true, users: users });
});

admin
  .route("/orders")
  .get(checkAdmin, async (req, res) => {
    if (req.query._id) {
      const order = await Order.findOne({ _id: req.query._id });
      return res.json({ Success: true, order: order });
    }
    const orders = await Order.find().sort({ _id: -1 });
    res.json({ Success: true, orders: orders });
  })
  .put(checkAdmin, async (req, res) => {
    await Order.findOneAndUpdate(
      { _id: req.query._id },
      { status: req.query.status }
    );
    res.json({ Success: true });
  });

admin
  .route("/coupon")
  .get(checkAdmin, async (req, res) => {
    if (req.query._id) {
      const coupon = await Coupon.findOne({ _id: req.query._id });
      return res.json({ Success: true, coupon: coupon });
    }
    const coupons = await Coupon.find();
    res.json({ Success: true, coupons: coupons });
  })
  .post(checkAdmin, async (req, res) => {
    if (await Coupon.findOne({ coupon_id: req.query.coupon_id })) {
      return res.json({ Success: false, Error: "Coupon already exists" });
    }
    await Coupon.create(req.body);
    res.json({ Success: true });
  })
  .delete(checkAdmin, async (req, res) => {
    await Coupon.deleteOne({ _id: req.query._id });
    res.json({ Success: true });
  });

admin.post("/post_notification", checkAdmin, async (req, res) => {
  const order = await Order.findOne({ _id: req.body._id });
  await Notification.create({
    uid: order.uid,
    message: req.body.message,
    datetime: Date.now(),
  });
  res.json({ Success: true });
});

admin
  .route("/banner")
  .get(async (req, res) => {
    const banners = await Banner.find().sort({ _id: -1 });
    res.json({ Success: true, banners: banners });
  })
  .post(async (req, res) => {
    await Banner.create(req.query);
    res.json({ Success: true });
  })
  .delete(async (req, res) => {
    await Banner.deleteOne(req.query);
    res.json({ Success: true });
  });

admin.post("/change_condition", checkAdmin, async (req, res) => {
  const condition = req.query;
  const key = Object.keys(condition)[1];
  const value = Number(condition[key]) !== 0;
  if (key === "isMostSelling") {
    await Product.findOneAndUpdate(
      { _id: condition._id },
      { isMostSelling: value }
    );
  } else if (key === "isTopSelling") {
    await Product.findOneAndUpdate(
      { _id: condition._id },
      { isTopSelling: value }
    );
  } else if (key === "isFeatured") {
    await Product.findOneAndUpdate(
      { _id: condition._id },
      { isFeatured: value }
    );
  }
  return res.json({
    Success: true,
  });
});

export default admin;
