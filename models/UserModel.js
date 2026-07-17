import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    verified: {
      type: Boolean,
      default: false,
    },
    verifyEmailCode: {
      type: String,
      select: false,
    },
    verifyEmailCodeExpires: {
      type: Date,
      select: false,
    },
    forgotPasswordCode: {
      type: String,
      select: false,
    },
    forgotPasswordCodeExpires: {
      type: Date,
      select: false,
    },
    cart: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        quantity: {
          type: Number,
          min: 1,
          default: 1,
        },
      },
    ],
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
  },
  { timestamps: true },
);

const UserModel = mongoose.model("User", UserSchema);
export default UserModel;
