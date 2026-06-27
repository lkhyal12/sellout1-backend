import express from "express";
import mongoose from "mongoose";
import dotEnv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import authRouter from "./routes/authRouter.js";
dotEnv.config();
const app = express();
app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  }),
);
app.use(cookieParser());

app.use("/api/auth", authRouter);
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  mongoose
    .connect(process.env.MONGO_URI)
    .then(() => console.log("connected to mongodb"))
    .catch((err) => console.log(err));
});
