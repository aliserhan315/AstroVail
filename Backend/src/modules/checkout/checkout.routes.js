import { Router } from "express";
import { authRequired } from "../../middleware/Auth.js";
import { createCheckout, finalizeOrderTest } from "./checkout.controller.js";

const router = Router();
router.post("/create", authRequired, createCheckout);
router.post("/finalize", authRequired, finalizeOrderTest);

export default router;
