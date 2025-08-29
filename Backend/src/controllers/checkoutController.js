
import { CheckoutService } from "../services/CheckoutService.js";
import { success, error } from "../utils/response.js";

export async function createCheckout(req, res) {
  try { return success(res, await CheckoutService.create(req.user.sub), "Order created"); }
  catch (e) { console.error("createCheckout:", e); return error(res, e.message, e.status || 500); }
}

export async function finalizeOrderTest(req, res) {
  try { return success(res, await CheckoutService.finalizePaid({ orderId: req.body.orderId }), "Order finalized"); }
  catch (e) { console.error("finalizeOrderTest:", e); return error(res, e.message, e.status || 500); }
}
