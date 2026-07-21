import express from "express";
import mongoose from "mongoose";
import dotEnv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import authRouter from "./routes/authRouter.js";
import productsRouter from "./routes/productsRouter.js";
import cartRouter from "./routes/cartRouter.js";
import paymentRouter from "./routes/paymentRouter.js";
dotEnv.config();
const app = express();
app.use(cookieParser());
app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  }),
);

app.use("/api/auth", authRouter);
app.use("/api/products", productsRouter);
app.use("/api/cart", cartRouter);
app.use("/api/checkout", paymentRouter);
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  mongoose
    .connect(process.env.MONGO_URI)
    .then(() => console.log("connected to mongodb"))
    .catch((err) => console.log(err));
});
