import mongoose from "mongoose";
import Cart from "../models/Cart.js";
import Star from "../models/Star.js";
import Order from "../models/Order.js";
import { getStripe, isStripeEnabled } from "../lib/stripe.js";

export const CheckoutService = {
  async create(userId) {
    const cart = await Cart.findOne({ userId }).lean();
    if (!cart || cart.items.length === 0) {
      throw Object.assign(new Error("Cart is empty"), { status: 400 });
    }

    const starIds = cart.items.map(i => i.starId);
    const stars = await Star.find({ _id: { $in: starIds } }).lean();

    const taken = stars.filter(s => s.owner);
    if (taken.length) {
      throw Object.assign(new Error("Some items already purchased"), {
        status: 409,
        details: taken.map(t => t._id),
      });
    }

    const amount = cart.items.reduce((sum, it) => sum + (it.priceCents || 0), 0);

    const order = await Order.create({
      userId,
      items: cart.items.map(i => ({ starId: i.starId, priceCents: i.priceCents })),
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
        line_items: cart.items.map(i => ({
          price_data: {
            currency: "usd",
            product_data: { name: "Star" },
            unit_amount: i.priceCents,
          },
          quantity: 1,
        })),
        metadata: { orderId: String(order._id) },
      });

      stripeSessionId = session.id;
      checkoutUrl = session.url;
      await Order.updateOne(
        { _id: order._id },
        { $set: { stripeSessionId, status: "processing" } }
      );
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
      const starIds = order.items.map(i => i.starId);

      const res = await Star.updateMany(
        { _id: { $in: starIds }, owner: null },
        { $set: { owner: userId } }
      ).session(session);

      if (res.modifiedCount !== starIds.length) {
        await Order.updateOne(
          { _id: orderId },
          { $set: { status: "failed_sold_out" } }
        ).session(session);
        await session.commitTransaction();
        return await Order.findById(orderId).lean();
      }

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
