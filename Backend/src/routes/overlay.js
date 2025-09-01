import express from "express";
import multer from "multer";
import sharp from "sharp";
import Star from "../models/Star.js";
import { solveWithAstrometry } from "../services/plateService.js";
import { wcsProjectXY } from "../utils/astro.js";
import { edgePointer, distanceInFOVs, humanizeHint } from "../utils/overlay.js";

const router = express.Router();
const upload = multer({ limits: { fileSize: 8 * 1024 * 1024 } });

router.post("/overlay", upload.single("image"), async (req, res) => {
  try {
    const { userStarId } = req.body;
    if (!req.file?.buffer || !userStarId) return res.status(400).json({ error: "image and userStarId required" });

    const normalized = await sharp(req.file.buffer).rotate().toBuffer();
    const meta = await sharp(normalized).metadata();
    const width = meta.width ?? 4000, height = meta.height ?? 3000;

    const calib = await solveWithAstrometry(normalized);
    const wcs = {
      centerRA: calib.ra,
      centerDec: calib.dec,
      rotationDeg: calib.rotation,
      pixScaleArcsec: calib.pixscale,
      width, height
    };

    const s = await Star.findById(userStarId, { ra:1, dec:1, mag:1, name:1 }).lean();
    if (!s) return res.status(404).json({ error: "Star not found" });

    const { x, y, inFrame, xr, yr } = wcsProjectXY(s.ra, s.dec, wcs, { returnVector: true });

    if (inFrame) {
      const r = Math.max(6, 14 - (s.mag ?? 7));
      return res.json({
        solved: true,
        image: { width, height },
        center: { ra: calib.ra, dec: calib.dec },
        inFrame: true,
        markers: [{ type:"circle", x, y, r, label: s.name || "Your star" }]
      });
    } else {
      const ptr = edgePointer(x, y, width, height, 24);
      const distanceFOV = distanceInFOVs(
        { ra: calib.ra, dec: calib.dec },
        { ra: s.ra, dec: s.dec },
        calib.pixscale,
        width, height
      );
      return res.json({
        solved: true,
        image: { width, height },
        center: { ra: calib.ra, dec: calib.dec },
        inFrame: false,
        guidance: {
          type: "edge-arrow",
          x: ptr.x, y: ptr.y, angleDeg: ptr.angleDeg,
          distanceFOV,
          hint: humanizeHint(ptr.angleDeg, distanceFOV)
        }
      });
    }
  } catch (e) {
    console.error("overlay:", e);
    return res.status(500).json({ solved: false, error: e.message });
  }
});

export default router;
