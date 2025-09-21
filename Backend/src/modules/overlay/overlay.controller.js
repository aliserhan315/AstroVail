export async function postStarDetection(req, res) {
  try {
    const { userStarId, imageBase64, image, base64 } = req.body || {};
    const buf = req.file?.buffer || decodeBase64Input(imageBase64 || image || base64);
    
    if (!buf || !userStarId) {
      return error(res, "image (base64) and userStarId required", 400);
    }
    const hash = crypto.createHash("sha1").update(buf).update(userStarId).digest("hex");
    const now = Date.now();
    const cached = cache.get(hash);
    if (cached && now - cached.t < TTL) {
      return success(res, cached.result);
    }
    const normalized = await sharp(buf).rotate().toBuffer();
    const meta = await sharp(normalized).metadata();
    const width = meta.width ?? 4000;
    const height = meta.height ?? 3000;
    const star = await Star.findById(userStarId, {
      ra: 1, dec: 1, magnitude: 1, mag: 1, name: 1, displayName: 1, constellation: 1
    }).lean();
    
    if (!star) {
      return error(res, "Star not found", 404);
    }

    const starName = star.displayName || star.name || "Your star";
    const starMagnitude = star.magnitude || star.mag || null;
    let calib;
    try {
      const timeoutMs = Number(process.env.OVERLAY_SOLVE_TIMEOUT_MS || 45000);
      const timed = Promise.race([
        solveWithAstrometry(normalized),
        new Promise((_, rej) => setTimeout(() => rej(new Error("solve_timeout")), timeoutMs)),
      ]);
      calib = await timed;
    } catch (e) {
      const aiAnalysis = await starDetectionAI({
        imageAnalyzed: false,
        star: { name: starName, magnitude: starMagnitude, constellation: star.constellation },
        error: e?.message || "solve_failed"
      });

      const result = {
        starFound: false,
        message: aiAnalysis.message,
        starName,
        imageAnalyzed: false,
        reason: e?.message || "solve_failed",
        ai: aiAnalysis
      };
      
      cache.set(hash, { t: now, result });
      return success(res, result);
    }
    const wcs = {
      centerRA: calib.ra,
      centerDec: calib.dec,
      rotationDeg: calib.rotation,
      pixScaleArcsec: calib.pixscale,
      width,
      height,
    };

    const { x, y, inFrame } = wcsProjectXY(star.ra, star.dec, wcs);
    const aiAnalysis = await starDetectionAI({
      imageAnalyzed: true,
      starFound: inFrame,
      star: { 
        name: starName, 
        ra: star.ra, 
        dec: star.dec, 
        magnitude: starMagnitude,
        constellation: star.constellation 
      },
      imageCenter: { ra: calib.ra, dec: calib.dec },
      position: inFrame ? { x, y } : null
    });

    const result = {
      starFound: inFrame,
      message: aiAnalysis.message,
      starName,
      imageAnalyzed: true,
      centerCoordinates: {
        ra: calib.ra,
        dec: calib.dec
      },
      ai: aiAnalysis
    };
    cache.set(hash, { t: now, result });
    return success(res, result);

  } catch (e) {
    console.error("Star detection error:", e);
    const aiAnalysis = await starDetectionAI({
      imageAnalyzed: false,
      systemError: true,
      error: e.message
    });

    return error(res, aiAnalysis?.message || "Failed to analyze image for star detection");
  }
}