import mongoose from "mongoose";
import { logError } from "../lib/utils.js";
import ProductModel from "../models/ProductModel.js";
import cloudinary from "../lib/cloudinary.js";

export async function getAllProductsController(req, res) {
  try {
    const products = await ProductModel.find().lean();
    return res
      .status(200)
      .json({ message: "Products sent successfully", products });
  } catch (err) {
    logError("getallproducts", err);
    return res.status(500).json({ message: "Server error" });
  }
}

// get single product
export async function getSingleProductConroller(req, res) {
  const { id } = req.params;
  if (!id) return res.status(400).json({ message: "Missing product id" });
  if (!mongoose.Types.ObjectId.isValid(id))
    return res.status(400).json({ message: "Invalid product id" });
  try {
    const product = await ProductModel.findById(id).lean();
    if (!product) return res.status(404).json({ message: "Product not found" });
    return res
      .status(200)
      .json({ message: "Product sent successfully", product });
  } catch (err) {
    logError("getSingle product controller ", err);
    return res.status(500).json({ message: "Server error" });
  }
}

// create product controller
export async function createProductController(req, res) {
  const { name, price, description, category, image } = req.body;

  if (!name || price == null || !description || !category || !image)
    return res.status(400).json({ message: "All fields are required" });
  try {
    const result = await cloudinary.uploader.upload(image, {
      folder: "images",
    });
    if (!result || !result.secure_url)
      return res.status(500).json({ message: "Image upload failed" });
    const product = await ProductModel.create({
      name,
      price: Number(price),
      category,
      description,
      image: result.secure_url,
    });
    return res
      .status(201)
      .json({ message: "Product created successfully", product });
  } catch (err) {
    logError("createProductController", err);
    return res.status(500).json({ message: "Server error" });
  }
}
