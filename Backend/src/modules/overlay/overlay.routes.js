import { Router } from "express";
import multer from "multer";
import { postOverlay } from "./overlay.controller.js";

const upload = multer({
  limits: { fileSize: (Number(process.env.OVERLAY_MAX_MB) || 8) * 1024 * 1024 },
});

function maybeMulter(req, res, next) {
  const ct = String(req.headers["content-type"] || "").toLowerCase();
  if (ct.includes("multipart/form-data")) {
    return upload.single("image")(req, res, next);
  }
  return next();
}

const router = Router();
router.post("/", maybeMulter, postOverlay);

export default router;
