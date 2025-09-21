export function wcsProjectXY(ra, dec, wcs) {
  const { centerRA, centerDec, width, height, pixScaleArcsec } = wcs;
  const deltaRA = (ra - centerRA) * Math.cos(dec * Math.PI / 180);
  const deltaDec = dec - centerDec;
  const x = width / 2 + (deltaRA * 3600) / pixScaleArcsec;
  const y = height / 2 - (deltaDec * 3600) / pixScaleArcsec;
  const inFrame = x >= 0 && x <= width && y >= 0 && y <= height;
  
  return { x, y, inFrame };
}

export function angularDistanceDeg(ra1, dec1, ra2, dec2) {
  const ra1Rad = ra1 * Math.PI / 180;
  const dec1Rad = dec1 * Math.PI / 180;
  const ra2Rad = ra2 * Math.PI / 180;
  const dec2Rad = dec2 * Math.PI / 180;
  const deltaRA = ra2Rad - ra1Rad;
  const a = Math.sin(dec1Rad) * Math.sin(dec2Rad) + 
           Math.cos(dec1Rad) * Math.cos(dec2Rad) * Math.cos(deltaRA);
  
  return Math.acos(Math.max(-1, Math.min(1, a))) * 180 / Math.PI;
}