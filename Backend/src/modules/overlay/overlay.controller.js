import sharp from "sharp";
import crypto from "crypto";

import Star from "../star/star.model.js"; 
import { solveWithAstrometry } from "./plate.service.js";
import { wcsProjectXY } from "../utils/astro.js";
import { edgePointer, distanceInFOVs, humanizeHint } from "./overlay.math.js";
import { starGuidanceTips } from "./overlay.tips.service.js";
import { circleSVG, arrowSVG } from "./overlay.svg.js";
import { success, error } from "../utils/http.js";

const cache = new Map();
const TTL = 120_000; 

export async function postOverlay(req, res) {
  try {
    const { userStarId, format } = req.body;
    if (!req.file?.buffer || !userStarId) {
      return error(res, "image and userStarId required", 400);
    }

    const hash = crypto
      .createHash("sha1")
      .update(req.file.buffer)
      .update(userStarId)
      .digest("hex");

    const now = Date.now();
    const cached = cache.get(hash);
    if (cached && now - cached.t < TTL && format !== "png") {
      return success(res, cached.payload);
    }

    // Normalize EXIF rotation and read dimensions
    const normalized = await sharp(req.file.buffer).rotate().toBuffer();
    const meta = await sharp(normalized).metadata();
    const width = meta.width ?? 4000;
    const height = meta.height ?? 3000;

    // Plate solve
    const calib = await solveWithAstrometry(normalized);
    const wcs = {
      centerRA: calib.ra,
      centerDec: calib.dec,
      rotationDeg: calib.rotation,
      pixScaleArcsec: calib.pixscale,
      width,
      height,
    };

    // Fetch target star
    const s = await Star.findById(userStarId, {
      ra: 1,
      dec: 1,
      magnitude: 1,
      mag: 1,
      name: 1,
      displayName: 1,
    }).lean();
    if (!s) return error(res, "Star not found", 404);

    const targetMag = typeof s.mag === "number" ? s.mag : s.magnitude;
    const label = s.displayName || s.name || "Your star";

    const { x, y, inFrame } = wcsProjectXY(s.ra, s.dec, wcs);

    let payload;
    if (inFrame) {
      const r = Math.max(6, 14 - (typeof targetMag === "number" ? targetMag : 7));
      const ai = await starGuidanceTips({
        inFrame: true,
        center: { ra: calib.ra, dec: calib.dec },
        target: { ra: s.ra, dec: s.dec, name: label, mag: targetMag },
      });
      payload = {
        solved: true,
        image: { width, height },
        center: { ra: calib.ra, dec: calib.dec },
        inFrame: true,
        markers: [{ type: "circle", x, y, r, label }],
        guidance: { hint: "Centered. Fine-tune focus and exposure." },
        ai: ai || undefined,
      };
    } else {
      const ptr = edgePointer(x, y, width, height, 24);
      const distanceFOV = distanceInFOVs(
        { ra: calib.ra, dec: calib.dec },
        { ra: s.ra, dec: s.dec },
        calib.pixscale,
        width,
        height
      );
      const ai = await starGuidanceTips({
        inFrame: false,
        angleDeg: ptr.angleDeg,
        distanceFOV,
        center: { ra: calib.ra, dec: calib.dec },
        target: { ra: s.ra, dec: s.dec, name: label, mag: targetMag },
      });
      payload = {
        solved: true,
        image: { width, height },
        center: { ra: calib.ra, dec: calib.dec },
        inFrame: false,
        guidance: {
          type: "edge-arrow",
          x: ptr.x,
          y: ptr.y,
          angleDeg: ptr.angleDeg,
          distanceFOV,
          hint: humanizeHint(ptr.angleDeg, distanceFOV),
        },
        ai: ai || undefined,
      };
    }

    // JSON path
    if (format !== "png") {
      cache.set(hash, { t: now, payload });
      return success(res, payload);
    }

    // PNG overlay path
    const svg = payload.inFrame
      ? circleSVG(
          payload.markers[0].x,
          payload.markers[0].y,
          payload.markers[0].r,
          payload.markers[0].label,
          width,
          height
        )
      : arrowSVG(
          payload.guidance.x,
          payload.guidance.y,
          payload.guidance.angleDeg,
          Math.min(width, height) / 3,
          width,
          height
        );

    const out = await sharp(normalized)
      .composite([{ input: svg, gravity: "northwest", left: 0, top: 0 }])
      .png()
      .toBuffer();

    res.setHeader("Content-Type", "image/png");
    return res.send(out);
  } catch (e) {
    console.error("overlay:", e);
    return error(res, e.message || "Overlay failed");
  }
}