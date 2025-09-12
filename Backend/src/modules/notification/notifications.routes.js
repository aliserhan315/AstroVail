import { Router } from "express";
import { authRequired } from "../../middleware/Auth.js";
import { listNotifications, markNotificationRead } from "./notification.controller.js";

const router = Router();

router.get("/", authRequired, listNotifications);
router.post("/:id/read", authRequired, markNotificationRead);

export default router;
