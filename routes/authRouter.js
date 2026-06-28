import express from "express";
import {
  getProfileController,
  loginController,
  logoutController,
  refreshController,
  signUpController,
} from "../controllers/authController.js";
import { protectedRoute } from "../middleware/protectedRoute.js";
import { lmmiter } from "../middleware/limmiter.js";

const authRouter = express.Router();
authRouter.post("/sign-up", signUpController);
authRouter.post("/login", loginController);
authRouter.post("/logout", logoutController);
authRouter.get("/profile", protectedRoute, getProfileController);
authRouter.get("/refresh", refreshController);
export default authRouter;
