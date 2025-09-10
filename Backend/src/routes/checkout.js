import { Router } from "express";
import { authRequired } from "../middleware/Auth.js";
import { createCheckout, finalizeOrderTest } from "../controllers/checkoutController.js";

const router = Router();
router.post("/create", authRequired, createCheckout);
router.post("/finalize", authRequired, finalizeOrderTest);

export default router;
