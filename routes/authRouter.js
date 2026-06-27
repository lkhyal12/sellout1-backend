import express from "express";
import {
  loginController,
  logoutController,
  signUpController,
} from "../controllers/authController.js";

const authRouter = express.Router();
authRouter.post("/sign-up", signUpController);
authRouter.post("/login", loginController);
authRouter.post("/logout", logoutController);
export default authRouter;
