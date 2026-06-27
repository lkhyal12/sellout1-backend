import express from "express";
import { signUpController } from "../controllers/authController.js";

const authRouter = express.Router();
authRouter.post("/sign-up", signUpController);
export default authRouter;
