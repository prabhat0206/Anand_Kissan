import mongoose from "./init";

const CategorySchema = new mongoose.Schema({
  name: String,
  image_url: String,
});

const BrandSchema = new mongoose.Schema({
  name: String,
  image_url: String,
});

const ProductSchema = new mongoose.Schema({
  name: String,
  image_url: String,
  category: String,
  brand: String,
  isMostSelling: Boolean,
  isFeatured: Boolean,
  isTopSelling: Boolean,
  description: String,
  actual_price: Number,
  sale_price: Number,
  in_stock: Number,
  quantity: String,
  technical: String,
});

ProductSchema.index({ "$**": "text" });

export const Category = mongoose.model("Category", CategorySchema);
export const Brand = mongoose.model("Brand", BrandSchema);
export const Product = mongoose.model("Product", ProductSchema);
