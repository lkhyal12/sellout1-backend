import express from "express";
import { protectedRoute } from "../middleware/protectedRoute.js";
import {
  addToCartController,
  getCartProducts,
  updateQuantityController,
} from "../controllers/cartController.js";

const cartRouter = express.Router();
cartRouter.get("/", protectedRoute, getCartProducts);
cartRouter.post("/items", protectedRoute, addToCartController);
cartRouter.patch("/items/:id", protectedRoute, updateQuantityController);
export default cartRouter;
