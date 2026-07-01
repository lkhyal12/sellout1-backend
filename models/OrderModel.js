import mongoose, { mongo } from "mongoose";

const OrderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    products: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
        },
        price: {
          type: Number,
          required: true,
        },
      },
    ],
    status: {
      type: String,
      enum: [
        "pending",
        "paid",
        "processing",
        "shipped",
        "delivered",
        "cancelled",
      ],
      default: "pending",
    },
    totalAmount: {
      type: Number,
      required: true,
    },
    stripeSessionId: {
      type: String,
      required: true,
      unique: true,
    },
  },
  { timestamps: true },
);

const OrderModel = mongoose.model("Order", OrderSchema);
export default OrderModel;
