import { Router } from "express";
import { createCheckout, finalizeOrderTest } from "../checkout/checkout.controller.js";

const router = Router();

router.post("/create",  createCheckout);
router.post("/finalize",  finalizeOrderTest);

export default router;
