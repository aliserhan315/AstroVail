import { createRequire } from "module";
const require = createRequire(import.meta.url);
const Stripe = require("stripe");

const API_VERSION = "2025-07-30.basil";
let _client = null;

export function isStripeEnabled() {
  return !!process.env.STRIPE_SECRET_KEY && !process.env.STRIPE_BYPASS;
}

export function getStripe() {
  if (_client) return _client;

  if (!isStripeEnabled()) {
    _client = {
      checkout: {
        sessions: {
          create: async () => ({
            id: "cs_test_mock",
            url: "https://example.com/mock-checkout",
          }),
        },
      },
      paymentIntents: {
        retrieve: async (id) => ({ id, status: "succeeded" }),
      },
      webhooks: {
        constructEvent() {
          throw new Error("webhook not used in tests");
        },
      },
    };
    return _client;
  }

  _client = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: API_VERSION,
  });
  return _client;
}
