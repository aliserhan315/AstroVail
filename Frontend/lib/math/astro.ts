export const DEG = Math.PI / 180;
export const RAD = 180 / Math.PI;

export const wrapPi = (a: number) => {
  while (a > Math.PI) a -= 2 * Math.PI;
  while (a < -Math.PI) a += 2 * Math.PI;
  return a;
};
export const wrap2pi = (a: number) => {
  while (a >= 2 * Math.PI) a -= 2 * Math.PI;
  while (a < 0) a += 2 * Math.PI;
  return a;
};

export function jdFromDate(d: Date) {
  return d.getTime() / 86400000 + 2440587.5;
}

export function gmstRad(d: Date) {
  const jd = jdFromDate(d);
  const T = (jd - 2451545.0) / 36525.0;
  const gmst =
    280.46061837 +
    360.98564736629 * (jd - 2451545.0) +
    0.000387933 * T * T -
    (T * T * T) / 38710000.0;
  return wrap2pi(gmst * DEG);
}

export function lstRad(d: Date, lonDeg: number) {
  return wrap2pi(gmstRad(d) + lonDeg * DEG);
}

export function radecToAzAlt(
  raDeg: number,
  decDeg: number,
  when: Date,
  latDeg: number,
  lonDeg: number
) {
  const ra = raDeg * DEG;
  const dec = decDeg * DEG;
  const lst = lstRad(when, lonDeg);
  const H = wrapPi(lst - ra);
  const lat = latDeg * DEG;

  const sinAlt =
    Math.sin(dec) * Math.sin(lat) +
    Math.cos(dec) * Math.cos(lat) * Math.cos(H);
  const alt = Math.asin(Math.max(-1, Math.min(1, sinAlt)));
  const y = -Math.sin(H) * Math.cos(dec);
  const x = Math.sin(dec) - Math.sin(lat) * sinAlt;
  const az = wrap2pi(Math.atan2(y, x)); 
  return { az, alt };
}
