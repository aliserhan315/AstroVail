export type Star = { id: number | string; raDeg: number; decDeg: number; mag: number; name?: string };

const d2r = Math.PI / 180;

export function gmst(date: Date) {
  const JD = date.getTime() / 86400000 + 2440587.5;
  const T = (JD - 2451545.0) / 36525;
  let h = 6.697374558 + 2400.051336 * T + 0.000025862 * T * T;
  h += date.getUTCHours() + date.getUTCMinutes() / 60 + date.getUTCSeconds() / 3600;
  return ((h % 24) + 24) % 24;
}

export function lst(date: Date, lonDeg: number) {
  return ((gmst(date) + lonDeg / 15) % 24 + 24) % 24;
}

export function raDecToAltAz(raHours: number, decDeg: number, latDeg: number, lstHours: number) {
  const d2r = Math.PI / 180;
  const H = (lstHours - raHours) * 15 * d2r;
  const dec = decDeg * d2r;
  const lat = latDeg * d2r;
  const sinAlt = Math.sin(dec) * Math.sin(lat) + Math.cos(dec) * Math.cos(lat) * Math.cos(H);
  const alt = Math.asin(sinAlt);
  const az = Math.atan2(
    -Math.sin(H) * Math.cos(dec),
    Math.sin(dec) * Math.cos(lat) - Math.cos(dec) * Math.sin(lat) * Math.cos(H)
  );
  return { alt, az };
}

export function enuFromAltAz(alt: number, az: number) {
  const x = Math.cos(alt) * Math.sin(az);
  const y = Math.sin(alt); 
  const z = Math.cos(alt) * Math.cos(az); 
  return [x, y, z] as [number, number, number];
}

export function quatToMatrix(q: { x: number; y: number; z: number; w: number }) {
  const { x, y, z, w } = q;
  const xx = x * x, yy = y * y, zz = z * z;
  const xy = x * y, xz = x * z, yz = y * z;
  const wx = w * x, wy = w * y, wz = w * z;
  return [
    [1 - 2 * (yy + zz), 2 * (xy + wz), 2 * (xz - wy)],
    [2 * (xy - wz), 1 - 2 * (xx + zz), 2 * (yz + wx)],
    [2 * (xz + wy), 2 * (yz - wx), 1 - 2 * (xx + yy)],
  ] as number[][];
}

export function rotY(rad: number) {
  const c = Math.cos(rad), s = Math.sin(rad);
  return [
    [c, 0, s],
    [0, 1, 0],
    [-s, 0, c],
  ] as number[][];
}

function mul3(a: number[][], b: number[][]) {
  const r = [
    [0, 0, 0],
    [0, 0, 0],
    [0, 0, 0],
  ];
  for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) r[i][j] = a[i][0] * b[0][j] + a[i][1] * b[1][j] + a[i][2] * b[2][j];
  return r as number[][];
}

function mul3v(a: number[][], v: [number, number, number]) {
  return [a[0][0] * v[0] + a[0][1] * v[1] + a[0][2] * v[2], a[1][0] * v[0] + a[1][1] * v[1] + a[1][2] * v[2], a[2][0] * v[0] + a[2][1] * v[1] + a[2][2] * v[2]] as [number, number, number];
}

export function projectStarField(input: {
  stars: Star[];
  when: Date;
  lat: number;
  lon: number;
  yawOffsetDeg: number; 
  screenW: number;
  screenH: number;
  fovXdeg: number;
  deviceQuat: { x: number; y: number; z: number; w: number } | null;
}) {
  const { stars, when, lat, lon, yawOffsetDeg, screenW, screenH, fovXdeg, deviceQuat } = input;
  if (!deviceQuat) return [] as { x: number; y: number; mag: number; label?: string }[];

  const LST = lst(when, lon); 
  const R_dev = quatToMatrix(deviceQuat); 
  const R_cal = rotY((yawOffsetDeg * d2r)); 
  const R_worldToDevice = mul3(R_dev, R_cal);

  const D2C = [
    [1, 0, 0],
    [0, 1, 0],
    [0, 0, -1],
  ];
  const R_worldToCam = mul3(D2C, R_worldToDevice);

  const f = 0.5 * screenW / Math.tan((fovXdeg * d2r) / 2);
  const out: { x: number; y: number; mag: number; label?: string }[] = [];

  for (const s of stars) {
    const raH = s.raDeg / 15;
    const { alt, az } = raDecToAltAz(raH, s.decDeg, lat, LST);
    if (alt < 0) continue;
    const vENU = enuFromAltAz(alt, az);
    const vCam = mul3v(R_worldToCam, vENU);
    const [X, Y, Z] = vCam;
    if (Z <= 0) continue; 
    const x = f * (X / Z) + screenW / 2;
    const y = -f * (Y / Z) + screenH / 2;
    if (x < -50 || x > screenW + 50 || y < -50 || y > screenH + 50) continue;
    out.push({ x, y, mag: s.mag, label: s.name });
  }
  out.sort((a, b) => a.mag - b.mag);
  return out.slice(0, 120);
}
