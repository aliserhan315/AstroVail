export function angularDistanceDeg(ra1, dec1, ra2, dec2) {
  const d2r = Math.PI / 180;
  const a = ra1 * d2r, b = dec1 * d2r, c = ra2 * d2r, d = dec2 * d2r;
  const cos = Math.sin(b)*Math.sin(d) + Math.cos(b)*Math.cos(d)*Math.cos(a - c);
  return Math.acos(Math.min(1, Math.max(-1, cos))) * (180 / Math.PI);
}
export function wcsProjectXY(ra, dec, wcs, opts = {}) {
  const { centerRA, centerDec, rotationDeg, pixScaleArcsec, width, height } = wcs;
  const d2r = Math.PI / 180, r2d = 180 / Math.PI;
  const ra0 = centerRA * d2r, dec0 = centerDec * d2r;
  const raR = ra * d2r, decR = dec * d2r;
  const cosc = Math.sin(dec0)*Math.sin(decR) + Math.cos(dec0)*Math.cos(decR)*Math.cos(raR - ra0);
  if (cosc <= 0) return { inFrame: false };
  const x_tan = (Math.cos(decR)*Math.sin(raR - ra0)) / cosc;
  const y_tan = (Math.cos(dec0)*Math.sin(decR) - Math.sin(dec0)*Math.cos(decR)*Math.cos(raR - ra0)) / cosc;
  const pxPerDeg = 1 / (pixScaleArcsec / 3600);
  const theta = (rotationDeg || 0) * d2r;
  const xr =  x_tan * r2d * pxPerDeg * Math.cos(theta) + y_tan * r2d * pxPerDeg * Math.sin(theta);
  const yr = -x_tan * r2d * pxPerDeg * Math.sin(theta) + y_tan * r2d * pxPerDeg * Math.cos(theta);
  const x = width/2 + xr, y = height/2 + yr;
  const inFrame = x >= 0 && x <= width && y >= 0 && y <= height;
  return opts.returnVector ? { x, y, inFrame, xr, yr } : { x, y, inFrame };
}
