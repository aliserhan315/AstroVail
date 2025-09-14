import axios from "axios";
import Order from "../checkout/order.model.js";
import Star from "../star/star.model.js";
import User from "../user/user.model.js";

const N8N_BASE_URL = (process.env.N8N_BASE_URL || "http://localhost:5678").replace(/\/+$/,"");
const N8N_WEBHOOK_PATH = (process.env.N8N_WEBHOOK_PATH || "order-certificate").replace(/^\/+/,"");
const N8N_WEBHOOK_METHOD = process.env.N8N_WEBHOOK_METHOD || "POST";
const N8N_WEBHOOK_TOKEN = process.env.N8N_WEBHOOK_TOKEN || null;

export async function notifyOrderCertificate(orderId) {
  const order = await Order.findById(orderId).lean();
  if (!order) return;

  const buyer = await User.findById(order.userId).lean();
  const starIds = order.items.map(i => i.starId);
  const stars = await Star.find({ _id: { $in: starIds } }).lean();

  const items = order.items.map(i => {
    const s = stars.find(st => String(st._id) === String(i.starId));
    return {
      starId: String(i.starId),
      baseName: s?.baseName ?? s?.name ?? null,
      displayName: s?.displayName ?? null,
      constellation: s?.constellation ?? null,
      ra: s?.ra ?? null,
      dec: s?.dec ?? null,
      magnitude: s?.magnitude ?? null,
      certificateStyle: i.certificateStyle || s?.certificateStyle || "classic",
      recipientEmail: i.recipientEmail || buyer?.email || null,
      priceCents: i.priceCents ?? 0,
    };
  });

  const url = `${N8N_BASE_URL}/webhook/${N8N_WEBHOOK_PATH}`;
  const headers = { "Content-Type": "application/json" };
  if (N8N_WEBHOOK_TOKEN) headers["X-Webhook-Token"] = N8N_WEBHOOK_TOKEN;

  try {
    await axios({
      url,
      method: N8N_WEBHOOK_METHOD,
      headers,
      data: {
        orderId: String(order._id),
        amount: order.amount,
        currency: order.currency,
        buyer: {
          id: String(buyer?._id || ""),
          email: buyer?.email ?? null,
          displayName: buyer?.displayName ?? null,
        },
        items,
      },
      timeout: 5000,
    });
  } catch (e) {
    console.error("notifyOrderCertificate failed:", e?.response?.status, e?.message);
  }
}
