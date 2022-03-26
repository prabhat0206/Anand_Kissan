import express from "express";
import { User, Address } from "../database/userdb";
import { Product } from "../database/productdb";
import { Notification } from "../database/others";

const auth = express.Router();

const requestAuth = (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  const token = req.headers.authorization;
  if (token) {
    if (token === process.env.AUTH) {
      next();
    } else {
      res.sendStatus(401);
    }
  } else {
    res.sendStatus(401);
  }
};

export const checkAuth = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  const token = req.headers.authorization?.replace("Bearer ", "");
  if (token) {
    const user = await User.findOne({ token: token });
    if (user) {
      res.locals.user = user;
      next();
    } else {
      res.sendStatus(401);
    }
  } else {
    res.sendStatus(401);
  }
};

auth.get("/check/:ph_number", requestAuth, async (req, res) => {
  const ph_number = req.params.ph_number;
  if (ph_number) {
    const user = await User.findOne({ ph_number: ph_number });
    if (user) {
      res.json({ Success: true });
    } else {
      res.json({ Success: false });
    }
  } else {
    res.sendStatus(402);
  }
});

auth.post("/login", requestAuth, async (req, res) => {
  const { ph_number, token } = req.body;
  const user = await User.findOneAndUpdate(
    { ph_number: ph_number },
    { token: token }
  );
  if (user) {
    res.json({
      isUser: true,
      user: user,
    });
  } else {
    res.sendStatus(401);
  }
});

auth.post("/register", requestAuth, async (req, res) => {
  const { ph_number, name, token } = req.body;
  const exist_user = await User.findOne({ ph_number: ph_number });
  if (!exist_user) {
    const new_user = await User.create({
      uid: Date.now() + ph_number.slice(0, 4),
      ph_number: ph_number,
      name: name,
      token: token,
    });
    res.json({
      Success: true,
      user: new_user,
    });
  } else {
    res.json({ Success: false, Error: "User already exists" });
  }
});

auth.get("", checkAuth, async (req, res) => {
  res.json({ Success: true, user: res.locals.user });
});

auth
  .route("/address")
  .get(checkAuth, async (req, res) => {
    const uid = res.locals.user.uid;
    if (req.query._id) {
      const address = await Address.findOne({ _id: req.query._id, uid: uid });
      return res.json({ Success: true, address: address });
    }
    const address = await Address.find({ uid: uid });
    res.json({
      Success: true,
      address: address,
    });
  })
  .post(checkAuth, async (req, res) => {
    req.body.uid = res.locals.user.uid;
    await Address.create(req.body);
    res.json({
      Success: true,
    });
  })
  .put(checkAuth, async (req, res) => {
    const id = req.body._id;
    const thingstoUpdate = req.body;
    delete thingstoUpdate._id;
    await Address.findOneAndUpdate({ _id: id }, thingstoUpdate);
    res.json({
      Success: true,
    });
  })
  .delete(checkAuth, async (req, res) => {
    await Address.deleteOne({ _id: req.body._id });
    res.json({ Success: true });
  });

auth
  .route("/wishlist")
  .get(checkAuth, async (req, res) => {
    const wishlist_arr = res.locals.user.wishlist;
    const wishlist_products = await Product.find({
      _id: { $in: wishlist_arr },
    });
    res.json({ Success: true, wishlist: wishlist_products });
  })
  .post(checkAuth, async (req, res) => {
    let wishlist_arr = res.locals.user.wishlist;
    if (wishlist_arr.includes(req.body._id)) {
      res.json({ Success: false, Error: "Product already in wishlist" });
    } else {
      wishlist_arr.push(req.body._id);
      await User.findOneAndUpdate(
        { uid: res.locals.user.uid },
        { wishlist: wishlist_arr }
      );
      res.json({ Success: true });
    }
  })
  .delete(checkAuth, async (req, res) => {
    let wishlist = res.locals.user.wishlist;
    if (wishlist.includes(req.body._id)) {
      for (let index in wishlist) {
        if (wishlist[index] === req.body._id) {
          wishlist.splice(index, 1);
        }
      }
      await User.findOneAndUpdate(
        { uid: res.locals.user.uid },
        { wishlist: wishlist }
      );
      res.json({ Success: true });
    } else {
      res.json({ Success: false, Error: "not in wishlist" });
    }
  });

auth
  .route("/cart")
  .get(checkAuth, async (req, res) => {
    const cart_Arr: any[] = res.locals.user.cart;
    let cart_ids: any[] = [];
    for (let item in cart_Arr) {
      cart_ids.push(cart_Arr[item]._id);
    }
    const products = await Product.find({ _id: { $in: cart_ids } });
    let final_arr: any[] = [];
    let total_price: number = 0;
    for (let index in products) {
      for (let cart_index in cart_Arr) {
        if (cart_Arr[cart_index]._id === products[index]._id.toString()) {
          final_arr.push({
            product: products[index],
            quantity: cart_Arr[cart_index].quantity,
          });
          total_price +=
            products[index].sale_price * cart_Arr[cart_index].quantity;
        }
      }
    }
    res.json({
      Success: true,
      data: { cart: final_arr, total_price: total_price },
    });
  })
  .post(checkAuth, async (req, res) => {
    const cart_arr = res.locals.user.cart;
    const { _id, quantity } = req.body;
    const finded_product_index = cart_arr.findIndex(
      (item: any) => item._id === _id
    );
    if (finded_product_index !== -1) {
      if (quantity === 0) {
        cart_arr.splice(finded_product_index, 1);
      } else {
        cart_arr[finded_product_index].quantity = quantity;
      }
      await User.findOneAndUpdate(
        { uid: res.locals.user.uid },
        { cart: cart_arr }
      );
      res.json({ Success: true });
    } else {
      cart_arr.push({ _id: _id, quantity: quantity });
      await User.findOneAndUpdate(
        { uid: res.locals.user.uid },
        { cart: cart_arr }
      );
      res.json({ Success: true });
    }
  })
  .delete(checkAuth, async (req, res) => {
    const cart_arr = res.locals.user.cart;
    for (let index in cart_arr) {
      if (cart_arr[index]._id === req.body._id) {
        cart_arr.splice(index, 1);
      }
    }
    await User.findOneAndUpdate(
      { uid: res.locals.user.uid },
      { cart: cart_arr }
    );
    res.json({ Success: true });
  });

auth.get("/notifications", checkAuth, async (req, res) => {
  const notifications = await Notification.find({
    uid: res.locals.user.uid,
  }).sort({ _id: -1 });
  return res.json({ Success: true, notifications: notifications });
});

export default auth;
