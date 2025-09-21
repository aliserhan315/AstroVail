import Order from "../checkout/order.model.js";
import Star from "../star/star.model.js";
import User from "../user/user.model.js";

const RAW = (process.env.N8N_WEBHOOK_URL || "").trim();
if (!RAW) {
  console.warn("[n8n] N8N_WEBHOOK_URL not set. Example: http://localhost:5678/webhook/order-certificate");
}
const N8N_URL = RAW.replace(/\/+$/, "");

const TIMEOUT_MS = Number(process.env.N8N_TIMEOUT_MS || 15000);

async function postJson(url, body) {
  if (!url) return false;
  const ctl = new AbortController();
  const timer = setTimeout(() => ctl.abort(), TIMEOUT_MS);
  try {
    console.log(`[n8n] POST -> ${url}`);
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: ctl.signal,
    });
    clearTimeout(timer);
    const txt = await res.text().catch(() => "");
    console.log(`[n8n] <- ${res.status} ${txt.slice(0, 200)}`);
    return res.ok;
  } catch (e) {
    clearTimeout(timer);
    console.error("[n8n] ERR:", e?.message || String(e));
    return false;
  }
}

export async function notifyOrderCertificate(orderId) {
  console.log(`[n8n] notifyOrderCertificate(orderId=${orderId})`);
  const order = await Order.findById(orderId).lean();
  if (!order) { console.warn("[n8n] order not found", orderId); return; }

  const buyer = await User.findById(order.userId).lean();
  const stars = await Star.find({ _id: { $in: (order.items || []).map(i => i.starId) } }).lean();

  const items = (order.items || []).map(i => {
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
      message: i.message ?? null,
    };
  });

  const payload = {
    event: "order.certificate.requested",
    version: 1,
    order: {
      id: String(order._id),
      amount: order.amount,
      currency: order.currency,
      status: order.status,
      buyer: {
        id: String(buyer?._id || ""),
        email: buyer?.email ?? null,
        displayName: buyer?.displayName ?? null,
      },
      items,
    },
    sentAt: new Date().toISOString(),
  };

  const ok = await postJson(N8N_URL, payload);
  if (!ok) console.error("[n8n] send failed (is workflow Active? URL correct?)");
}
