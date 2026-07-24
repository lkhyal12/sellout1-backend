import {
  generateTokens,
  logError,
  sendEmailVerification,
  sendForgotPasswordLinkFun,
  userObj,
} from "../lib/utils.js";
import UserModel from "../models/UserModel.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";

export async function signUpController(req, res) {
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
    const code = Math.floor(Math.random() * 900000) + 100000;
    const { success } = await sendEmailVerification(user, code);
    console.log({ user });
    user.verifyEmailCode = code;
    user.verifyEmailCodeExpires = new Date(Date.now() + 15 * 60 * 1000);
    await user.save();

    const { accessToken, refreshToken } = generateTokens(user);
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "none",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    return res.status(201).json({
      message:
        "User created successfully Please your email to verify your email",
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
    let message = "You logged in successfully";
    if (!user.verified) {
      const code = Math.floor(Math.random() * 900000) + 100000;
      await sendEmailVerification(user, code);
      user.verifyEmailCode = code;
      user.verifyEmailCodeExpires = new Date(Date.now() + 15 * 60 * 1000);
      await user.save();
      message = "Please check your email to verify your account";
    }
    if (!isPasswordValid)
      return res.status(400).json({ message: "Invalid Credentials" });
    const { accessToken, refreshToken } = generateTokens(user);
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "none",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res
      .status(200)
      .json({ message: message, accessToken, user: userObj(user) });
  } catch (err) {
    logError("login", err);
    return res.status(500).json({ message: "Server error", err });
  }
}

// logout contrroller
export async function logoutController(req, res) {
  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "none",
  });
  return res.status(200).json({ message: "Logged out successfully" });
}

// get profile controller
export async function getProfileController(req, res) {
  return res
    .status(200)
    .json({ message: "User sent successfully", user: req.user });
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
// send verification email controller

export async function sendEmailVerifcationController(req, res) {
  const { email } = req.body;
  if (!email?.trim())
    return res.status(400).json({ message: "Missing email address" });

  try {
    const user = await UserModel.findOne({ email }).select(
      "-password +verifyEmailCodeExpires +verifyEmailCode",
    );
    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.verified)
      return res.status(200).json({ message: "This Account already verified" });

    const code = Math.floor(Math.random() * 900000) + 100000;

    user.verifyEmailCode = code.toString();
    user.verifyEmailCodeExpires = new Date(Date.now() + 15 * 60 * 1000);
    await user.save();
    const { success } = await sendEmailVerification(user, code);
    if (!success)
      return res.status(500).json({
        message: "Failed to send a verification code please try again later",
      });

    return res.status(200).json({ message: "Verification code successfully " });
  } catch (err) {
    return res.status(500).json({ message: "Server error " });
  }
}

// verify email controller

export async function verifyEmailController(req, res) {
  const { email, code } = req.body;
  if (!email) return res.status(400).json({ message: "Missing email address" });
  if (!code)
    return res.status(400).json({ message: "Missing verificatio code" });

  try {
    const user = await UserModel.findOne({ email }).select(
      "+verifyEmailCode +verifyEmailCodeExpires -password",
    );
    if (!user) return res.status(404).json({ message: "User not found" });
    if (
      user.verifyEmailCode !== code.toString() ||
      user.verifyEmailCodeExpires <= Date.now()
    )
      return res.status(400).json({ message: "Invalid or expired code" });
    user.verified = true;
    user.verifyEmailCode = null;
    user.verifyEmailCodeExpires = null;
    await user.save();
    return res
      .status(200)
      .json({ message: "Email verified successfully", user });
  } catch (err) {
    logError("verifyEmail", err);
    return res.status(500).json({ message: "Server error" });
  }
}

// send forgot password controller
export async function sendForgotPasswordController(req, res) {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: "Email is required" });

  try {
    const user = await UserModel.findOne({ email }).select(
      "-password +forgotPasswordCode +forgotPasswordCodeExpires",
    );
    if (!user)
      return res.status(200).json({
        message:
          "If this email exists, you will receive a password reset email",
      });
    const code = crypto.randomBytes(16).toString("hex");

    user.forgotPasswordCode = code;
    user.forgotPasswordCodeExpires = Date.now() + 15 * 60 * 1000;
    await user.save();
    const { success } = await sendForgotPasswordLinkFun(user, code);
    if (success) {
      return res.status(200).json({
        message:
          "If this email exists, you will receive a password reset email",
      });
    }
    throw new Error("something went wrong");
  } catch (err) {
    console.log("error in the sendforgotcontroller ", err);
    return res.status(500).json({ message: "Server error" });
  }
}

export async function resetPasswordController(req, res) {
  const { password } = req.body;
  const { code } = req.params;

  if (!password)
    return res.status(400).json({ message: "Password is required" });
  if (!code)
    return res.status(400).json({ message: "Reset Password code is missing" });
  try {
    const user = await UserModel.findOne({ forgotPasswordCode: code }).select(
      "+forgotPasswordCodeExpires +forgotPasswordCode -password",
    );
    if (!user)
      return res.status(400).json({ message: "Invalid or expired code" });
    if (user.forgotPasswordCodeExpires <= Date.now())
      return res.status(400).json({ message: "Invalid or expired code" });
    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;
    user.forgotPasswordCode = null;
    user.forgotPasswordCodeExpires = null;
    await user.save();
    return res.status(200).json({ message: "Password reset successfully" });
  } catch (err) {
    logError("resetPassword", err);
    return res.status(500).json({ message: "Server error" });
  }
}
