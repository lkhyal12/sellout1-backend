import { generateTokens, logError } from "../lib/utils.js";
import UserModel from "../models/UserModel.js";
import bcrypt from "bcryptjs";

export async function signUpController(req, res) {
  const { email, name, password } = req.body;
  const trimmedName = name.trim();
  const emailTrimmed = email.trim();
  if (!trimmedName || !emailTrimmed || !password)
    return res.status(400).json({ message: "All fields are required" });
  try {
    const existingUser = await UserModel.findOne({ email: emailTrimmed });

    if (existingUser)
      return res.status(409).json({ message: "Email already taken" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await UserModel.create({
      name: trimmedName,
      email: emailTrimmed,
      password: hashedPassword,
    });
    const { accessToken, refreshToken } = generateTokens(user);
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    return res
      .status(201)
      .json({
        message: "User created successfully",
        accessToken,
        user: {
          name: user.name,
          role: user.role,
          email: user.email,
          userId: user._id,
          cart: user.cart,
        },
      });
  } catch (err) {
    logError("signUp controller", err);
    return res.status(500).json({ message: "Server error" });
  }
}
