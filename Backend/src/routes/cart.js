

import { Router } from "express";
import { authRequired } from "../middleware/Auth.js";
import { getCart, addToCart, removeFromCart, updateCartItem } from "../controllers/CartController.js";

const router = Router();

router.get("/", authRequired, getCart);
router.post("/items", authRequired, addToCart);
router.patch("/items/:starId", authRequired, updateCartItem);
router.delete("/items/:starId", authRequired, removeFromCart);

export default router;
