import { generateTokens, logError, userObj } from "../lib/utils.js";
import UserModel from "../models/UserModel.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
export async function signUpController(req, res) {
  console.log(req.body);
  const { email, name, password } = req.body;
  const trimmedName = name?.trim();
  const emailTrimmed = email?.trim();
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
    return res.status(201).json({
      message: "User created successfully",
      accessToken,
      user: userObj(user),
    });
  } catch (err) {
    logError("signUp controller", err);
    return res.status(500).json({ message: "Server error" });
  }
}

// login controller
export async function loginController(req, res) {
  const { email, password } = req.body;
  if (!email?.trim() || !password)
    return res.status(400).json({ message: "Email And Password Are Required" });

  try {
    const user = await UserModel.findOne({ email: email.trim() });
    if (!user) return res.status(400).json({ message: "Invalid Credentials" });
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid)
      return res.status(400).json({ message: "Invalid Credentials" });
    const { accessToken, refreshToken } = generateTokens(user);
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res
      .status(200)
      .json({ message: "You are Logged in", accessToken, user: userObj(user) });
  } catch (err) {
    logError("login", err);
    return res.status(500).json({ message: "Server error" });
  }
}

// logout contrroller
export async function logoutController(req, res) {
  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  });
  return res.status(200).json({ message: "Logged out successfully" });
}

// get profile controller
export async function getProfileController(req, res) {
  return res
    .status(200)
    .json({ message: "User sent successfully", user: userObj(req.user) });
}

export async function refreshController(req, res) {
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken)
    return res.status(401).json({ message: "Missing refreshToken" });
  try {
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    const user = await UserModel.findById(decoded.userId).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    const { accessToken } = generateTokens(user);
    return res
      .status(200)
      .json({ message: "New accessToken was issued", accessToken });
  } catch (err) {
    logError("refresh", err);
    return res.status(401).json({ message: "Invalid refreshToken" });
  }
}
