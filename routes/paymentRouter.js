import express from "express";
import { protectedRoute } from "../middleware/protectedRoute.js";
import {
  checkoutSuccess,
  createCheckoutSession,
} from "../controllers/paymentController.js";
const paymentRouter = express.Router();
paymentRouter.post("/create-session", protectedRoute, createCheckoutSession);

paymentRouter.post("/success", protectedRoute, checkoutSuccess);
export default paymentRouter;
