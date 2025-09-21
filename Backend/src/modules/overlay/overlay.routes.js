import { Router } from "express";
import { postStarDetection } from "./overlay.controller.js";

const router = Router();
router.post("/detect", postStarDetection);

export default router;