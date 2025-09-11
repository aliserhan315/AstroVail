import mongoose from "mongoose";
import Cart from "../models/Cart.js";
import Star from "../models/Star.js";
import Order from "../models/Order.js";
import User from "../models/User.js";
import { getStripe, isStripeEnabled } from "../lib/stripe.js";

export const CheckoutService = {
  async create(userId) {
    const cart = await Cart.findOne({ userId }).lean();
    if (!cart || cart.items.length === 0) {
      throw Object.assign(new Error("Cart is empty"), { status: 400 });
    }

    const starIds = cart.items.map((i) => i.starId);
    const stars = await Star.find({ _id: { $in: starIds } }).lean();

    const taken = stars.filter((s) => s.owner);
    if (taken.length) {
      throw Object.assign(new Error("Some items already purchased"), {
        status: 409,
        details: taken.map((t) => t._id),
      });
    }

    const amount = cart.items.reduce((sum, it) => sum + (it.priceCents || 0), 0);

    const order = await Order.create({
      userId,
      items: cart.items.map((i) => ({
        starId: i.starId,
        priceCents: i.priceCents,
        recipientEmail: i.recipientEmail || null,
      })),
      amount,
      currency: "USD",
      status: "requires_payment",
    });

    let checkoutUrl = "https://example.com/mock-checkout";
    let stripeSessionId = null;

    if (isStripeEnabled()) {
      const stripe = getStripe();
      const session = await stripe.checkout.sessions.create({
        mode: "payment",
        success_url: `${process.env.APP_URL}/checkout/success?o=${order._id}`,
        cancel_url: `${process.env.APP_URL}/checkout/cancel?o=${order._id}`,
        line_items: cart.items.map((i) => ({
          price_data: {
            currency: "usd",
            product_data: { name: "Star" },
            unit_amount: i.priceCents,
          },
          quantity: 1,
        })),
        metadata: { orderId: String(order._id) },
      });
      checkoutUrl = session.url;
      stripeSessionId = session.id;
      await Order.updateOne({ _id: order._id }, { $set: { stripePaymentIntentId: session.id, status: "processing" } });
    }

    return {
      orderId: order._id.toString(),
      amount,
      currency: "USD",
      checkoutUrl,
      stripeSessionId,
    };
  },

  async finalizePaid({ orderId }) {
    const session = await mongoose.startSession();
    try {
      session.startTransaction();

      const order = await Order.findById(orderId).session(session);
      if (!order) throw Object.assign(new Error("Order not found"), { status: 404 });
      if (order.status === "paid") return order;
      if (!["requires_payment", "processing"].includes(order.status)) {
        throw Object.assign(new Error("Order not payable"), { status: 409 });
      }

      const userId = order.userId;
      let success = true;
      for (const item of order.items) {
        let owner = userId;
        let pendingOwnerEmail;
        const email = item.recipientEmail ? String(item.recipientEmail).trim().toLowerCase() : null;
        if (email) {
          const existing = await User.findOne({ email }).lean();
          if (existing) {
            owner = existing._id;
          } else {
            owner = null;
            pendingOwnerEmail = email;
          }
        }
        const res = await Star.updateOne(
          { _id: item.starId, owner: null, pendingOwnerEmail: null },
          { $set: { owner, pendingOwnerEmail } }
        ).session(session);
        if (res.modifiedCount !== 1) {
          success = false;
          break;
        }
      }

      if (!success) {
        await Order.updateOne(
          { _id: orderId },
          { $set: { status: "failed_sold_out" } }
        ).session(session);
        await session.commitTransaction();
        return await Order.findById(orderId).lean();
      }

      const starIds = order.items.map((i) => i.starId);

      await Order.updateOne(
        { _id: orderId },
        { $set: { status: "paid" } }
      ).session(session);

      await Cart.updateOne(
        { userId },
        { $pull: { items: { starId: { $in: starIds } } } }
      ).session(session);

      await session.commitTransaction();
      return await Order.findById(orderId).lean();
    } catch (e) {
      await session.abortTransaction();
      throw e;
    } finally {
      session.endSession();
    }
  },
};
