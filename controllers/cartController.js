import mongoose from "mongoose";
import { logError } from "../lib/utils.js";
import ProductModel from "../models/ProductModel";
import UserModel from "../models/UserModel.js";

export async function getCartProducts(req, res) {
  const userId = req.user._id;
  try {
    const user = await UserModel.findById(userId).populate("cart.product");

    if (!user) return res.status(404).json({ message: "User not found" });

    return res
      .status(200)
      .json({ message: "products sent successfully", products: user.cart });
  } catch (err) {
    logError("getCartProductsController", err);
    return res.status(500).json({ message: "Server error" });
  }
}

export async function addToCartController(req, res) {
  const userId = req.user._id;
  const { productId } = req.body;
  if (!productId)
    return res.status(400).json({ message: "Missing Product ID" });
  try {
    const existingProduct = await ProductModel.findById(productId);
    if (!existingProduct)
      return res.status(404).json({ message: "Product not found" });
    const user = await UserModel.findById(userId).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });

    const product = user.cart.find(
      (item) => item.product.toString() === productId.toString(),
    );
    if (product) product.quantity++;
    else user.cart.push({ product: productId, quantity: 1 });
    await user.save();

    return res
      .status(200)
      .json({ message: "Product added successfully", cart: user.cart });
  } catch (err) {
    logError("addToCartController", err);
    return res.status(500).json({ message: "Server error" });
  }
}

// update quantity controller

export async function updateQuantityController(req, res) {
  const { quantity } = req.body;
  const { id: productId } = req.params;
  if (!productId)
    return res.status(400).json({ message: "Missing product ID" });

  if (!mongoose.Types.ObjectId.isValid(productId))
    return res.status(400).json({ message: "Invalid Product ID" });

  if (!Number.isInteger(quantity) || quantity <= 0)
    return res
      .status(400)
      .json({ message: "Qunatity must be a valid integer" });

  try {
    const user = await UserModel.findById(req.user._id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    const product = user.cart.find(
      (item) => item.product.toString() === productId.toString(),
    );
    if (!product) return res.status(404).json({ message: "Product not found" });
    product.quantity = quantity;
    await user.save();
    return res
      .status(200)
      .json({ message: "Quantity update successfully", cart: user.cart });
  } catch (err) {
    logError("updateQuantityController", err);
    return res.status(500).json({ message: "Server error" });
  }
}

// remove from cart controller
export async function removeFromCartController(req, res) {
  const { id } = req.params;
  if (!id) return res.status(400).json({ message: "Missing product ID" });
  if (!mongoose.Types.ObjectId.isValid(id))
    return res.status(400).json({ message: "Invalid product ID" });

  try {
    const user = await UserModel.findById(req.user._id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    const originalCartLength = user.cart.length;
    user.cart = user.cart.filter(
      (item) => item.product.toString() !== id.toString(),
    );
    if (user.cart.length === originalCartLength)
      return res.status(404).json({ message: "Product not found in cart" });
    await user.save();

    return res
      .status(200)
      .json({ message: "Product removed from cart", cart: user.cart });
  } catch (err) {
    logError("removeFromCartController", err);
    return res.status(500).json({ message: "Server error" });
  }
}

// cleart cart controller
export async function clearCartController(req, res) {
  try {
    const user = await UserModel.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });
    user.cart = [];
    await user.save();
    return res
      .status(200)
      .json({ message: "Cart cleared successfully", cart: user.cart });
  } catch (err) {
    logError("clearCartController", err);
    return res.status(500).json({ message: "Server error" });
  }
}
