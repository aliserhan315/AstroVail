import Cart from "../models/Cart.js";
import Star from "../models/Star.js";

const PRICE_CENTS = 3000;

export const CartService = {
  async get(userId) {
    return (await Cart.findOne({ userId }).lean()) || { userId, items: [] };
  },

  async addItem(userId, starId) {
    const star = await Star.findById(starId).lean();
    if (!star) throw Object.assign(new Error("Star not found"), { status: 404 });
    if (star.owner) throw Object.assign(new Error("Star already purchased"), { status: 409 });
    // Ensure cart exists without using upsert to avoid duplicate-key race
    let cart = await Cart.findOne({ userId }).lean();
    if (!cart) {
      try {
        await Cart.create({ userId, items: [] });
      } catch (e) {
        if (!(e && e.code === 11000)) throw e; // ignore if created concurrently
      }
    }
    const updated = await Cart.findOneAndUpdate(
      { userId, "items.starId": { $ne: starId } },
      { $push: { items: { starId, priceCents: PRICE_CENTS } } },
      { new: true }
    );
    return updated || (await Cart.findOne({ userId }).lean());
  },

  async updateItem(userId, starId, { recipientEmail }) {
    const set = {};
    if (recipientEmail !== undefined) {
      const email = String(recipientEmail).trim().toLowerCase();
      set["items.$.recipientEmail"] = email || null;
    }
    const updated = await Cart.findOneAndUpdate(
      { userId, "items.starId": starId },
      { $set: set },
      { new: true }
    );
    if (!updated) {
      throw Object.assign(new Error("Cart item not found"), { status: 404 });
    }
    return updated;
  },

  async removeItem(userId, starId) {
    const out = await Cart.findOneAndUpdate(
      { userId },
      { $pull: { items: { starId } } },
      { new: true }
    );
    return out || { userId, items: [] };
  },
};
