export type Q = [number, number, number, number];

export function toQ(q: Q | { x: number; y: number; z: number; w: number } | number[]): Q {
  const a = Array.isArray(q) ? q : [q.x, q.y, q.z, q.w];
  return [Number(a[0] ?? 0), Number(a[1] ?? 0), Number(a[2] ?? 0), Number(a[3] ?? 1)];
}

export function toObjQ(q: Q | { x: number; y: number; z: number; w: number } | number[]) {
  if (Array.isArray(q)) return { x: Number(q[0] ?? 0), y: Number(q[1] ?? 0), z: Number(q[2] ?? 0), w: Number(q[3] ?? 1) };
  return { x: Number((q as any).x ?? 0), y: Number((q as any).y ?? 0), z: Number((q as any).z ?? 0), w: Number((q as any).w ?? 1) };
}

export function qConj([x, y, z, w]: Q): Q { return [-x, -y, -z, w]; }
export function qMul([ax, ay, az, aw]: Q, [bx, by, bz, bw]: Q): Q {
  return [
    aw * bx + ax * bw + ay * bz - az * by,
    aw * by - ax * bz + ay * bw + az * bx,
    aw * bz + ax * by - ay * bx + az * bw,
    aw * bw - ax * bx - ay * by - az * bz,
  ];
}
export function rotateVecByQ(v: [number, number, number], q: Q): [number, number, number] {
  const vq: Q = [v[0], v[1], v[2], 0];
  const qi = qConj(q);
  const r = qMul(qMul(q, vq), qi);
  return [r[0], r[1], r[2]];
}

export function quatToYawPitch(qin: { x: number; y: number; z: number; w: number }) {
  const { x, y, z, w } = qin;
  const yaw = Math.atan2(2 * (w * z + x * y), 1 - 2 * (y * y + z * z)); // [-π,π]
  const pitch = Math.asin(Math.max(-1, Math.min(1, 2 * (w * y - z * x)))); // [-π/2,π/2]
  return { az: yaw >= 0 ? yaw : yaw + 2 * Math.PI, alt: pitch };
}
