import { Router } from "express";
import { authRequired } from "../middleware/Auth.js";
import { listNotifications, markNotificationRead } from "../controllers/notificationController.js";

const router = Router();

router.get("/", authRequired, listNotifications);
router.post("/:id/read", authRequired, markNotificationRead);

export default router;
