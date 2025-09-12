import { Router } from "express";
import { authRequired } from "../../middleware/Auth.js";
import {
  listEvents,
  getEvent,
  remindEvent,
} from "./event.controller.js"


const router = Router();

router.get("/", listEvents);
router.get("/:id", getEvent);
router.post("/:id/remind", authRequired, remindEvent);

export default router;
