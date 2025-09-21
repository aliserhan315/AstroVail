import { Router } from "express";
import auth from "../modules/auth/auth.routes.js";
import events from "../modules/events/events.routes.js";
import notifications from "../modules/notification/notifications.routes.js";
import checkout from "../modules/checkout/checkout.routes.js";
import cart from "../modules/cart/cart.routes.js";
import user from "../modules/user/user.routes.js";
import stars from "../modules/star/stars.routes.js";
import overlayRoute from "../modules/overlay/overlay.routes.js";
import ownership from "../modules/ownership/ownership.routes.js";
import certificates from "../modules/certificates/certificates.routes.js";
import ai from "../modules/ai/ai.routes.js";

const router = Router();

router.use("/auth", auth);
router.use("/stars", stars);
router.use("/events", events);
router.use("/notifications", notifications);
router.use("/checkout", checkout);
router.use("/cart", cart);
router.use("/me", user);
router.use("/overlay", overlayRoute);
router.use("/ownership", ownership);
router.use("/certificates", certificates);
router.use("/ai", ai);

export default router;
