import mongoose from "mongoose";
import Cart from "../cart/cart.model.js";
import Star from "../star/star.model.js";
import Order from "../checkout/order.model.js";
import User from "../user/user.model.js";

export const CheckoutService = {
  async create(userId) {
    const session = await mongoose.startSession();
    try {
      session.startTransaction();

      const cart = await Cart.findOne({ userId }).session(session).lean();
      if (!cart || !Array.isArray(cart.items) || cart.items.length === 0) {
        throw Object.assign(new Error("Cart is empty"), { status: 400 });
      }

      const starIds = cart.items.map((i) => i.starId);

      const amount = cart.items.reduce((sum, it) => sum + (it.priceCents || 0), 0);

      const [order] = await Order.create(
        [
          {
            userId,
            items: cart.items.map((i) => ({
              starId: i.starId,
              priceCents: i.priceCents || 0,
              recipientEmail: i.recipientEmail || null,
            })),
            amount,
            currency: "USD",
            status: "requires_payment",
          },
        ],
        { session }
      );

      const ops = [];
      for (const item of cart.items) {
        const email = item.recipientEmail ? String(item.recipientEmail).trim().toLowerCase() : null;

        let owner = userId;
        let pendingOwnerEmail = null;

        if (email) {
          const existing = await User.findOne({ email }).session(session).lean();
          if (existing) {
            owner = existing._id;
          } else {
            owner = null;
            pendingOwnerEmail = email;
          }
        }

        ops.push({
          updateOne: {
            filter: { _id: item.starId, owner: null, pendingOwnerEmail: null },
            update: { $set: { owner, pendingOwnerEmail, isGifted: !!email } },
          },
        });
      }

      const bulk = await Star.bulkWrite(ops, { session, ordered: true });
      const modified = bulk.modifiedCount ?? 0;

      if (modified !== cart.items.length) {
        await Order.updateOne(
          { _id: order._id },
          { $set: { status: "failed_sold_out" } }
        ).session(session);

        await session.commitTransaction();
        return await Order.findById(order._id).lean();
      }

      await Order.updateOne(
        { _id: order._id },
        { $set: { status: "paid" } }
      ).session(session);

      await Cart.updateOne(
        { userId },
        { $pull: { items: { starId: { $in: starIds } } } }
      ).session(session);

      await session.commitTransaction();

      try {
        const orderDoc = await Order.findById(order._id).lean();
        const buyer = await User.findById(userId).lean();
        const { OwnershipBlockchain } = await import("../../services/ownership.service.js");

        for (const it of orderDoc.items) {
          const targetEmail = (it.recipientEmail || buyer?.email || "").trim();
          if (!targetEmail) continue;
          await OwnershipBlockchain.mintToEmail({
            email: targetEmail,
            starId: it.starId,
            orderId: String(orderDoc._id),
          });
        }
      } catch (e) {
        console.error("Minting after checkout failed:", e);
      }

      return await Order.findById(order._id).lean();
    } catch (e) {
      await session.abortTransaction();
      throw e;
    } finally {
      session.endSession();
    }
  },

  async finalizePaid({ orderId }) {
    const session = await mongoose.startSession();
    try {
      session.startTransaction();

      const order = await Order.findById(orderId).session(session);
      if (!order) throw Object.assign(new Error("Order not found"), { status: 404 });
      if (order.status === "paid") {
        await session.commitTransaction();
        return order.toObject();
      }
      if (!["requires_payment", "processing"].includes(order.status)) {
        throw Object.assign(new Error("Order not payable"), { status: 409 });
      }

      const ops = [];
      for (const item of order.items) {
        const email = item.recipientEmail ? String(item.recipientEmail).trim().toLowerCase() : null;

        let owner = order.userId;
        let pendingOwnerEmail = null;

        if (email) {
          const existing = await User.findOne({ email }).session(session).lean();
          if (existing) {
            owner = existing._id;
          } else {
            owner = null;
            pendingOwnerEmail = email;
          }
        }

        ops.push({
          updateOne: {
            filter: { _id: item.starId, owner: null, pendingOwnerEmail: null },
            update: { $set: { owner, pendingOwnerEmail, isGifted: !!email } },
          },
        });
      }

      const bulk = await Star.bulkWrite(ops, { session, ordered: true });
      const modified = bulk.modifiedCount ?? 0;
      if (modified !== order.items.length) {
        await Order.updateOne(
          { _id: orderId },
          { $set: { status: "failed_sold_out" } }
        ).session(session);

        await session.commitTransaction();
        return await Order.findById(orderId).lean();
      }

      await Order.updateOne({ _id: orderId }, { $set: { status: "paid" } }).session(session);
      await Cart.updateOne(
        { userId: order.userId },
        { $pull: { items: { starId: { $in: order.items.map((i) => i.starId) } } } }
      ).session(session);

      await session.commitTransaction();

      try {
        const orderDoc = await Order.findById(orderId).lean();
        const buyer = await User.findById(orderDoc.userId).lean();
        const { OwnershipBlockchain } = await import("../../services/ownership.service.js");
        for (const item of orderDoc.items) {
          const targetEmail = (item.recipientEmail || buyer?.email || "").trim();
          if (!targetEmail) continue;
          await OwnershipBlockchain.mintToEmail({ email: targetEmail, starId: item.starId, orderId });
        }
      } catch (e) {
        console.error("Minting after finalize failed:", e);
      }

      return await Order.findById(orderId).lean();
    } catch (e) {
      await session.abortTransaction();
      throw e;
    } finally {
      session.endSession();
    }
  },
};
