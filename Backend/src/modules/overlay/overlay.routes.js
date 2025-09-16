import { Router } from "express";
import multer from "multer";
import { postOverlay } from "./overlay.controller.js";

const upload = multer({
  limits: { fileSize: (Number(process.env.OVERLAY_MAX_MB) || 8) * 1024 * 1024 },
});

const router = Router();
router.post("/", upload.single("image"), postOverlay);

export default router;
