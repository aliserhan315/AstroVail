import { CartService } from "../services/CartService.js";
import { success, error } from "../utils/response.js";

export async function getCart(req, res) {
  try { return success(res, await CartService.get(req.user.sub)); }
  catch (e) { console.error("getCart:", e); return error(res); }
}
export async function addToCart(req, res) {
  try { return success(res, await CartService.addItem(req.user.sub, req.body.starId), "Added"); }
  catch (e) { console.error("addToCart:", e); return error(res, e.message, e.status || 500); }
}
export async function removeFromCart(req, res) {
  try { return success(res, await CartService.removeItem(req.user.sub, req.params.starId), "Removed"); }
  catch (e) { console.error("removeFromCart:", e); return error(res); }
}
