import sharp from "sharp";
import crypto from "crypto";

import Star from "../star/star.model.js";
import { solveWithAstrometry } from "./plate.service.js";
import { wcsProjectXY } from "../../utils/astro.js";
import { edgePointer, distanceInFOVs, humanizeHint } from "./overlay.math.js";
import { starGuidanceTips } from "./overlay.tips.service.js";
import { circleSVG, arrowSVG, messageSVG } from "./overlay.svg.js";
import { success, error } from "../../utils/response.js";

const cache = new Map();
const TTL = 120_000; 

export async function postOverlay(req, res) {
  try {
    const { userStarId, format } = req.body || {};

    let imageBuffer = null;
    if (req.file?.buffer) {
      imageBuffer = req.file.buffer;
    } else if (typeof req.body?.imageBase64 === "string" || typeof req.body?.image === "string") {
      let b64 = String(req.body.imageBase64 || req.body.image);
      if (b64.startsWith("data:")) {
        const idx = b64.indexOf(",");
        b64 = idx >= 0 ? b64.slice(idx + 1) : b64;
      }
      try {
        imageBuffer = Buffer.from(b64, "base64");
      } catch {
        return error(res, "Invalid base64 image", 400);
      }
    }

    if (!imageBuffer || !userStarId) {
      return error(res, "image and userStarId required", 400);
    }

    const hash = crypto
      .createHash("sha1")
      .update(imageBuffer)
      .update(userStarId)
      .digest("hex");

    const now = Date.now();
    const cached = cache.get(hash);
    if (cached && now - cached.t < TTL && format !== "png") {
      return success(res, cached.payload);
    }

    const normalized = await sharp(imageBuffer).rotate().toBuffer();
    const metaFull = await sharp(normalized).metadata();
    const widthFull = metaFull.width ?? 4000;
    const heightFull = metaFull.height ?? 3000;

    const maxDim = Number(process.env.OVERLAY_SOLVE_MAX_DIM || 1600);
    const resized = await sharp(normalized)
      .resize({ width: maxDim, height: maxDim, fit: "inside", withoutEnlargement: true })
      .toBuffer();
    const metaSmall = await sharp(resized).metadata();
    const widthSmall = metaSmall.width ?? widthFull;
    const heightSmall = metaSmall.height ?? heightFull;
    const scale = Math.max(1, widthFull / Math.max(1, widthSmall));

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

    let calib;
    try {
      calib = await solveWithAstrometry(resized);
    } catch (e) {
      const fallbackTips = [
        "We couldn't recognize the star field.",
        "Try a steadier shot with sharper stars.",
        "Increase exposure or ISO slightly.",
        "Include a wider sky region if possible.",
      ];

      if (format === "png") {
        const svg = messageSVG([
          `Could not locate ${label || "target"}.`,
          "Make sure stars are in focus and visible.",
          "Retake and try again.",
        ], widthFull, heightFull);

        const out = await sharp(normalized)
          .composite([{ input: svg, gravity: "northwest", left: 0, top: 0 }])
          .png()
          .toBuffer();
        res.setHeader("Content-Type", "image/png");
        return res.send(out);
      }

      return success(
        res,
        {
          solved: false,
          reason: (e && e.message) || "solve_failed",
          image: { width: widthFull, height: heightFull },
          inFrame: null,
          guidance: {
            type: "unsolved",
            hint: `We couldn't confirm ${label || "the star"} in this photo. Try another photo with clearer stars.`,
            suggestions: fallbackTips,
          },
          target: { name: label, ra: s.ra, dec: s.dec },
          links: {
            skyMap: `https://server8.sky-map.org/starview?ra=${encodeURIComponent(s.ra)}&de=${encodeURIComponent(s.dec)}&zoom=7`,
            aladin: `https://aladin.u-strasbg.fr/AladinLite/?target=${encodeURIComponent(s.ra+" "+s.dec)}&fov=1&survey=P%2FDSS2%2Fcolor`,
          },
        },
        "OK"
      );
    }

    const wcs = {
      centerRA: calib.ra,
      centerDec: calib.dec,
      rotationDeg: calib.rotation,
      pixScaleArcsec: calib.pixscale / scale,
      width: widthFull,
      height: heightFull,
    };

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
        image: { width: widthFull, height: heightFull },
        center: { ra: calib.ra, dec: calib.dec },
        inFrame: true,
        markers: [{ type: "circle", x, y, r, label }],
        guidance: { hint: "Centered. Fine-tune focus and exposure." },
        ai: ai || undefined,
      };
    } else {
      const ptr = edgePointer(x, y, widthFull, heightFull, 24);
      const distanceFOV = distanceInFOVs(
        { ra: calib.ra, dec: calib.dec },
        { ra: s.ra, dec: s.dec },
        calib.pixscale / scale,
        widthFull,
        heightFull
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
        image: { width: widthFull, height: heightFull },
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
          widthFull,
          heightFull
        )
      : arrowSVG(
          payload.guidance.x,
          payload.guidance.y,
          payload.guidance.angleDeg,
          Math.min(widthFull, heightFull) / 3,
          widthFull,
          heightFull
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
