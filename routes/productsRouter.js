import express from "express";
import { isAdmin } from "../middleware/isAdmin.js";
import { protectedRoute } from "../middleware/protectedRoute.js";
import {
  createProductController,
  getAllProductsController,
  getFeaturedProducts,
  getProductsByCategoryController,
  getSingleProductConroller,
  removeProductController,
  toggleFeaturedProduct,
} from "../controllers/productsController.js";

const productsRouter = express.Router();
productsRouter.get("/", protectedRoute, isAdmin, getAllProductsController);
productsRouter.get("/featured", getFeaturedProducts);
productsRouter.get("/:id", getSingleProductConroller);
productsRouter.get("/category/:category", getProductsByCategoryController);
productsRouter.delete("/:id", protectedRoute, isAdmin, removeProductController);
productsRouter.patch("/:id", protectedRoute, isAdmin, toggleFeaturedProduct);
productsRouter.post(
  "/create",
  protectedRoute,
  isAdmin,
  createProductController,
);
export default productsRouter;
