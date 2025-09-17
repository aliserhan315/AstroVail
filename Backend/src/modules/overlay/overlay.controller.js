import sharp from "sharp";
import crypto from "crypto";

import Star from "../star/star.model.js"; 
import { solveWithAstrometry } from "./plate.service.js";
import { wcsProjectXY } from "../../utils/astro.js";
import { edgePointer, distanceInFOVs, humanizeHint } from "./overlay.math.js";
import { starGuidanceTips } from "./overlay.tips.service.js";
import { circleSVG, arrowSVG, messageSVG } from "./overlay.svg.js";
import { success,error } from "../../utils/response.js";

const cache = new Map();
const TTL = 120_000; 

function decodeBase64Input(raw) {
  if (!raw) return null;
  const s = String(raw);
  const base64 = s.includes(",") ? s.slice(s.indexOf(",") + 1) : s;
  try { return Buffer.from(base64, "base64"); } catch { return null; }
}

export async function postOverlay(req, res) {
  try {
    const { userStarId, format = "json", imageBase64, image, base64 } = req.body || {};
    const buf = req.file?.buffer || decodeBase64Input(imageBase64 || image || base64);
    if (!buf || !userStarId) {
      return error(res, "image (base64) and userStarId required", 400);
    }

    const hash = crypto.createHash("sha1").update(buf).update(userStarId).digest("hex");
    const now = Date.now();
    const cached = cache.get(hash);
    if (cached && now - cached.t < TTL && format !== "png" && format !== "png-base64") {
      return success(res, cached.payload);
    }

    const normalized = await sharp(buf).rotate().toBuffer();
    const meta = await sharp(normalized).metadata();
    const width = meta.width ?? 4000;
    const height = meta.height ?? 3000;

    let calib;
    try {
      const timeoutMs = Number(process.env.OVERLAY_SOLVE_TIMEOUT_MS || 45000);
      const timed = Promise.race([
        solveWithAstrometry(normalized),
        new Promise((_, rej) => setTimeout(() => rej(new Error("solve_timeout")), timeoutMs)),
      ]);
      calib = await timed;
    } catch (e) {
      // Graceful fallback: unsolved result with guidance
      const friendly = `We couldn't locate ${userStarId ? 'the target' : 'the star'} in this photo.`;
      const tips = [
        "Try a steadier shot with sharper stars.",
        "Increase exposure/ISO slightly (avoid overexposure).",
        "Capture a wider sky region if possible.",
      ];

      if (format === "png" || format === "png-base64") {
        const svg = messageSVG([
          friendly,
          "Make sure stars are in focus and visible.",
          "Then try again with a steadier photo.",
        ], width, height);
        const out = await sharp(normalized).composite([{ input: svg, gravity: "northwest", left: 0, top: 0 }]).png().toBuffer();
        if (format === "png-base64") {
          const dataUrl = `data:image/png;base64,${out.toString("base64")}`;
          return success(res, { pngDataUrl: dataUrl, meta: { solved: false } });
        }
        res.setHeader("Content-Type", "image/png");
        return res.send(out);
      }

      // JSON fallback
      return success(res, {
        solved: false,
        reason: e?.message || "solve_failed",
        image: { width, height },
        inFrame: null,
        guidance: {
          type: "unsolved",
          hint: "Target not found in this photo. Try another image or open Live Finder.",
          suggestions: tips,
        },
      }, "OK");
    }
    const wcs = {
      centerRA: calib.ra,
      centerDec: calib.dec,
      rotationDeg: calib.rotation,
      pixScaleArcsec: calib.pixscale,
      width,
      height,
    };

    const s = await Star.findById(userStarId, {
      ra: 1, dec: 1, magnitude: 1, mag: 1, name: 1, displayName: 1,
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

    if (format === "json") {
      cache.set(hash, { t: now, payload });
      return success(res, payload);
    }

    const svg = payload.inFrame
      ? circleSVG(payload.markers[0].x, payload.markers[0].y, payload.markers[0].r, payload.markers[0].label, width, height)
      : arrowSVG(payload.guidance.x, payload.guidance.y, payload.guidance.angleDeg, Math.min(width, height) / 3, width, height);

    const out = await sharp(normalized).composite([{ input: svg, gravity: "northwest", left: 0, top: 0 }]).png().toBuffer();

    if (format === "png-base64") {
      const dataUrl = `data:image/png;base64,${out.toString("base64")}`;
      return success(res, { pngDataUrl: dataUrl, meta: payload });
    }

    res.setHeader("Content-Type", "image/png");
    return res.send(out);
  } catch (e) {
    console.error("overlay:", e);
    return error(res, e.message || "Overlay failed");
  }
}
