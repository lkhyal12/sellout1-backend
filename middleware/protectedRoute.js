import jwt from "jsonwebtoken";
import UserModel from "../models/UserModel.js";
import { logError } from "../lib/utils.js";
export async function protectedRoute(req, res, next) {
  const bearer = req.headers.authorization;
  if (!bearer) return res.status(401).json({ message: "Missing accessToken" });

  const accessToken = bearer.startsWith("Bearer ") ? bearer.slice(7) : bearer;
  if (!accessToken)
    return res.status(401).json({ message: "Missing accessToken" });

  try {
    const decoded = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
    const user = await UserModel.findById(decoded.userId).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    req.user = user;
    next();
  } catch (err) {
    logError("protected route", err);
    res.status(401).json({ message: "Invalid accessToken" });
  }
}
