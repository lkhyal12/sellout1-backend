import Stripe from "stripe";
import UserModel from "../models/UserModel.js";
import { logError } from "../lib/utils.js";
import OrderModel from "../models/OrderModel.js";

let stripe = null;

if (process.env.STRIPE_SECRET_KEY) {
  stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
}

export async function createCheckoutSession(req, res) {
  try {
    const user = await UserModel.findById(req.user._id).populate(
      "cart.product",
    );
    if (!user) return res.status(404).json({ message: "User not found" });
    if (user.cart.length === 0)
      return res.status(400).json({ message: "Your cart is empty" });
    const lineItems = user.cart.map((item) => ({
      price_data: {
        currency: "usd",

        product_data: {
          name: item.product.name,
          images: [item.product.image],
        },
        unit_amount: Math.round(item.product.price * 100),
      },
      quantity: item.quantity,
    }));

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: lineItems,
      success_url: `${process.env.CLIENT_URL}/checkout-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.CLIENT_URL}/cart`,
      customer_email: user.email,
      metadata: {
        userId: user._id.toString(),
        cartItems: user.cart.length.toString(),
      },
    });

    return res
      .status(200)
      .json({ message: "Checkout session created", url: session.url });
  } catch (err) {
    logError("createCheckoutSession", err);
    return res.status(500).json({ message: "Server error" });
  }
}

// checkout success controller
export async function checkoutSuccess(req, res) {
  const { sessionId } = req.body;
  if (!sessionId)
    return res.status(400).json({ message: "Missing session ID" });

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    if (session.metadata.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Unauthorized" });
    }
    if (session.payment_status != "paid")
      return res.status(400).json({ message: "Payment not completed" });
    const existingOrder = await OrderModel.findOne({
      stripeSessionId: session.id,
    });
    if (existingOrder)
      return res.status(200).json({
        message: "Order is being processed",
        orderId: existingOrder._id.toString(),
      });
    const user = await UserModel.findById(req.user._id).populate(
      "cart.product",
    );

    if (!user) return res.status(404).json({ message: "User not found" });
    if (user.cart.length === 0)
      return res.status(400).json({ message: "Cart is empty" });

    const products = user.cart.map((item) => ({
      productId: item.product._id,
      name: item.product.name,
      image: item.product.image,
      quantity: item.quantity,
      price: item.product.price,
    }));

    // const totalAmount = products.reduce(
    //   (ac, el) => ac + el.price * el.quantity,
    //   0,
    // );
    const totalAmount = session.amount_total / 100;
    const order = await OrderModel.create({
      userId: user._id,
      products,
      totalAmount,
      stripeSessionId: session.id,
      status: "paid",
    });
    user.cart = [];
    await user.save();
    return res.status(201).json({
      message: "Order created successfully",
      orderId: order._id.toString(),
    });
  } catch (err) {
    logError("checkoutsuccess", err);
    return res.status(500).json({ message: "Server error " });
  }
}
