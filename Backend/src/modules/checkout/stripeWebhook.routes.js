import express from "express";
import { CheckoutService } from "./checkout.service.1.js";
import { getStripe } from "../../lib/stripe.js";


const stripe = getStripe();
const router = express.Router();

router.post(
  "/webhooks/stripe",
  express.raw({ type: "application/json" }),
  async (req, res) => {
    const sig = req.headers["stripe-signature"];
    let event;

    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (err) {
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    try {
      switch (event.type) {
        case "checkout.session.completed": {
          const session = event.data.object;
          await CheckoutService.finalizeStripeSession({ session });
          break;
        }
        case "checkout.session.expired": {
          const session = event.data.object;
          await CheckoutService.markOrderExpired?.(session.id);
          break;
        }
        default:
          break;
      }
      return res.json({ received: true });
    } catch (e) {
      console.error("Webhook handler error:", e);
      return res.status(500).send("handler-failed");
    }
  }
);

export default router;
