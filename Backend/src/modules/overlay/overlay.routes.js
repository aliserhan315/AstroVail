import { Router } from "express";
import { postOverlay } from "./overlay.controller.js";

const router = Router();
router.post("/", postOverlay);

export default router;
