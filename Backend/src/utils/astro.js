export function angularDistanceDeg(ra1, dec1, ra2, dec2) {
  const d2r = Math.PI / 180;
  const a1 = ra1 * d2r, b1 = dec1 * d2r, a2 = ra2 * d2r, b2 = dec2 * d2r;
  const sinb1 = Math.sin(b1), sinb2 = Math.sin(b2);
  const cosb1 = Math.cos(b1), cosb2 = Math.cos(b2);
  const dA = wrapDeg(ra2 - ra1) * d2r;
  const cosd = sinb1 * sinb2 + cosb1 * cosb2 * Math.cos(dA);
  return Math.acos(Math.min(1, Math.max(-1, cosd))) * (180 / Math.PI);
}

function wrapDeg(d) { while (d > 180) d -= 360; while (d < -180) d += 360; return d; }

export function wcsProjectXY(ra, dec, wcs) {
  const { centerRA, centerDec, rotationDeg, pixScaleArcsec, width, height } = wcs;
  const d2r = Math.PI / 180;
  const dRA = wrapDeg(ra - centerRA) * Math.cos(centerDec * d2r);
  const dDec = dec - centerDec;
  const degPerPix = pixScaleArcsec / 3600;
  let dx = dRA / degPerPix;
  let dy = dDec / degPerPix;
  const th = rotationDeg * d2r;
  const rx = Math.cos(th) * dx + Math.sin(th) * dy;
  const ry = -Math.sin(th) * dx + Math.cos(th) * dy;
  const cx = width / 2, cy = height / 2;
  const x = cx + rx;
  const y = cy - ry;
  const inFrame = x >= 0 && x <= width && y >= 0 && y <= height;
  return { x, y, inFrame };
}
