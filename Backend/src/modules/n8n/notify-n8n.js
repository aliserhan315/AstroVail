import Order from "../checkout/order.model.js";
import Star from "../star/star.model.js";
import User from "../user/user.model.js";

const N8N_BASE_URL = (process.env.N8N_BASE_URL || "http://localhost:5678").replace(/\/+$/, "");
const N8N_WEBHOOK_PATH = (process.env.N8N_WEBHOOK_PATH || "order-certificate").replace(/^\/+/, "");
const N8N_WEBHOOK_METHOD = process.env.N8N_WEBHOOK_METHOD || "POST";
const N8N_WEBHOOK_TOKEN = process.env.N8N_WEBHOOK_TOKEN || null;

const TIMEOUT_MS = 15000;
const RETRIES = 2;

async function postJson(url, body) {
  const ctl = new AbortController();
  const timer = setTimeout(() => ctl.abort(), TIMEOUT_MS);
  const headers = { "Content-Type": "application/json" };

  if (N8N_WEBHOOK_TOKEN) headers["X-N8N-SECRET"] = N8N_WEBHOOK_TOKEN;

  try {
    const res = await fetch(url, {
      method: N8N_WEBHOOK_METHOD,
      headers,
      body: JSON.stringify(body),
      signal: ctl.signal,
    });
    clearTimeout(timer);
    const text = await res.text().catch(() => "");
    return { ok: res.ok, status: res.status, text };
  } catch (e) {
    clearTimeout(timer);
    return { ok: false, status: 0, text: e?.message || String(e) };
  }
}

async function sendToN8n(payload) {
  const prodUrl = `${N8N_BASE_URL}/webhook/${N8N_WEBHOOK_PATH}`;
  const testUrl = `${N8N_BASE_URL}/webhook-test/${N8N_WEBHOOK_PATH}`;

  for (let attempt = 0; attempt < RETRIES; attempt++) {
    const r1 = await postJson(prodUrl, payload);
    if (r1.ok) { console.log(`[n8n] OK via ${prodUrl}`); return true; }
    if (r1.status !== 404) { console.error(`[n8n] ${prodUrl} -> ${r1.status} ${r1.text}`); return false; }

    const r2 = await postJson(testUrl, payload);
    if (r2.ok) { console.log(`[n8n] OK via ${testUrl}`); return true; }
    console.error(`[n8n] ${testUrl} -> ${r2.status} ${r2.text}`);
    await new Promise(r => setTimeout(r, 400 * (attempt + 1)));
  }
  return false;
}

export async function notifyOrderCertificate(orderId) {
  const order = await Order.findById(orderId).lean();
  if (!order) { console.warn("[n8n] order not found:", orderId); return; }

  const buyer = await User.findById(order.userId).lean();
  const starIds = (order.items || []).map(i => i.starId);
  const stars = await Star.find({ _id: { $in: starIds } }).lean();

  const items = (order.items || []).map(i => {
    const s = stars.find(st => String(st._id) === String(i.starId));
    const style = i.certificateStyle || s?.certificateStyle || "classic";
    return {
      starId: String(i.starId),
      baseName: s?.baseName ?? s?.name ?? null,
      displayName: s?.displayName ?? null,
      constellation: s?.constellation ?? null,
      ra: s?.ra ?? null,
      dec: s?.dec ?? null,
      magnitude: s?.magnitude ?? null,
      certificateStyle: style,
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
    idempotencyKey: `cert:${String(order._id)}`,
    sentAt: new Date().toISOString(),
  };

  const ok = await sendToN8n(payload);
  if (!ok) console.error("[n8n] notifyOrderCertificate failed (see logs above).");
}
