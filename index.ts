import express from "express";
import bodyParser from "body-parser";
import { config } from "dotenv";
import admin from "./views/admin";
import auth from "./views/auth";
import home from "./views/home";
import order from "./views/order";

config();

const app = express();
app.use(bodyParser.json());

app.get("", (req, res) => {
  return res.json({ message: "Server is running" });
});
app.use("/admin", admin);
app.use("/api/auth", auth);
app.use("/api/order", order);
app.use("/api", home);

app.listen(5000, () => {
  console.log("listening on port 5000");
});
