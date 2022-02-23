import express from "express";
import { Product } from "../database/productdb";
import { Order, Address, User } from "../database/userdb";
import { checkAuth } from "./auth";
import Razorpay from "razorpay";
import dotenv from "dotenv";

dotenv.config();
const order = express.Router();
const payment = new Razorpay({
  key_id: process.env.RZ_KEY,
  key_secret: process.env.RZ_SECRET,
});

order.get("/payment/:amount", async (req, res) => {
  const amount = Number(req.params.amount) * 100;
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

order.get("/status/:status", checkAuth, async (req, res) => {
  const status = req.params.status.toLowerCase();
  const orders = await Order.find({
    uid: res.locals.user.uid,
    status: status,
  }).sort({ _id: -1 });
  res.json({
    Success: true,
    orders: orders,
  });
});

interface OrderProductT {
  _id: string;
  name: string;
  image_url: string;
  price: string;
  quantity: number;
}

order
  .route("")
  .get(checkAuth, async (req, res) => {
    // single order
    if (req.query._id) {
      let order: any = await Order.findOne({ _id: req.query._id });
      return res.json({ Success: true, order: order });
    }

    // multiple orders
    const orders: any[] = await Order.find({ uid: res.locals.user.uid }).sort({
      _id: -1,
    });
    res.json({
      Success: true,
      orders: orders,
    });
  })
  .post(checkAuth, async (req, res) => {
    if (req.body.payment_method !== "COD") {
      const params = {
        razorpay_order_id: req.body.order_id,
        razorpay_payment_id: req.body.payment_id,
        razorpay_signature: req.body.signature,
      };
      if ((await payment.utility.verify_payment_signature(params)) === false) {
        res.json({ Success: false, Error: "Payment signature not verified" });
      } else {
        delete req.body.signature;
      }
    }
    let total_amount: number = 0;
    const product_arr = req.body.products;
    let product_ids: String[] = [];
    for (let pindex in product_arr) {
      product_ids.push(product_arr[pindex]._id);
    }
    let address = await Address.findOne({ _id: req.body.address });
    delete address.uid;
    req.body.address = address;
    const products: any[] = await Product.find({ _id: { $in: product_ids } });
    const new_product_Arr: OrderProductT[] = [];
    for (let qindex in products) {
      for (let pindex in product_arr) {
        if (products[qindex]._id.toString() === product_arr[pindex]._id) {
          new_product_Arr.push({
            _id: products[qindex]._id,
            name: products[qindex].name,
            image_url: products[qindex].image_url,
            price: products[qindex].sale_price,
            quantity: product_arr[pindex].quantity,
          });
          total_amount +=
            products[qindex].sale_price * product_arr[pindex].quantity;
        }
      }
    }
    req.body.total_amount = total_amount;
    req.body.products = new_product_Arr;
    req.body.status = "order placed";
    req.body.date = Date.now();
    req.body.uid = res.locals.user.uid;
    await Order.create(req.body);
    await User.findOneAndUpdate({ uid: res.locals.user.uid }, { cart: [] });
    res.json({
      Success: true,
    });
  })
  .put(checkAuth, async (req, res) => {
    await Order.findOneAndUpdate(
      { _id: req.query._id },
      { status: "canceled" }
    );
    res.json({ Success: true });
  });

export default order;
