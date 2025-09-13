import {CheckoutService} from "./checkout.service.js";
import { success, error } from "../../utils/response.js";

export async function createCheckout(req, res) {
  try {
    const out = await CheckoutService.create(req.user.sub);
    return success(res, out, out?.status === "paid" ? "Order paid and finalized" : "Some items sold out");
  } catch (e) {
    console.error("createCheckout:", e);
    return error(res, e.message, e.status || 500);
  }
}

export async function finalizeOrderTest(req, res) {
  try {
    const out = await CheckoutService.finalizePaid({ orderId: req.body.orderId });
    return success(res, out, "Order finalized");
  } catch (e) {
    console.error("finalizeOrderTest:", e);
    return error(res, e.message, e.status || 500);
  }
}
