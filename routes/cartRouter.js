import express from "express";
import { protectedRoute } from "../middleware/protectedRoute.js";
import {
  addToCartController,
  clearCartController,
  getCartProducts,
  removeFromCartController,
  updateQuantityController,
} from "../controllers/cartController.js";

const cartRouter = express.Router();
cartRouter.get("/", protectedRoute, getCartProducts);
cartRouter.post("/items", protectedRoute, addToCartController);
cartRouter.patch("/items/:id", protectedRoute, updateQuantityController);
cartRouter.delete("/items/:id", protectedRoute, removeFromCartController);
cartRouter.delete("/clear", protectedRoute, clearCartController);
export default cartRouter;
