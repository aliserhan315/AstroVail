import { angularDistanceDeg } from "../../utils/astro.js";

export function edgePointer(x, y, w, h, pad = 24) {
  const cx = w / 2, cy = h / 2;
  const xr = x - cx, yr = y - cy;
  const denom = Math.max(
    Math.abs(xr) / Math.max(1, w / 2 - pad),
    Math.abs(yr) / Math.max(1, h / 2 - pad),
    1
  );
  const px = cx + xr / denom;
  const py = cy + yr / denom;
  const angleRad = Math.atan2(yr, xr);
  const angleDeg = (angleRad * 180) / Math.PI;
  return { x: px, y: py, angleRad, angleDeg };
}

export function distanceInFOVs(center, target, pixscaleArcsec, w, h) {
  const distDeg = angularDistanceDeg(center.ra, center.dec, target.ra, target.dec);
  const diagPx = Math.hypot(w, h);
  const diagDeg = (diagPx * pixscaleArcsec) / 3600.0;
  const radiusDeg = diagDeg / 2;
  return distDeg / radiusDeg;
}

export function humanizeHint(angleDeg, distanceFOV) {
  const dirs = [
    { name: "right", ang: 0 },
    { name: "down-right", ang: 45 },
    { name: "down", ang: 90 },
    { name: "down-left", ang: 135 },
    { name: "left", ang: 180 },
    { name: "up-left", ang: -135 },
    { name: "up", ang: -90 },
    { name: "up-right", ang: -45 },
  ];
  const nearest = dirs.reduce((a, d) =>
    Math.abs(delta(angleDeg, d.ang)) < Math.abs(delta(angleDeg, a.ang)) ? d : a
  , dirs[0]);
  const dist = distanceFOV.toFixed(1);
  return `Move ~${dist} FOV ${nearest.name}`;
}

function delta(a, b) {
  let d = a - b;
  while (d > 180) d -= 360;
  while (d < -180) d += 360;
  return d;
}
