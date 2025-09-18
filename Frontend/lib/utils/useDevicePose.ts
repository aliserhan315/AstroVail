import { useEffect, useState } from "react";
import { DeviceMotion } from "expo-sensors";

export type Pose = { q: { x: number; y: number; z: number; w: number }; ts: number } | null;

export function useDevicePose(): Pose {
  const [pose, setPose] = useState<Pose>(null);

  useEffect(() => {
    DeviceMotion.setUpdateInterval(50); // ~20 Hz
    const sub = DeviceMotion.addListener((data) => {
      // @ts-ignore - expo web uses rotation.quaternion; native may expose quaternion directly
      const qq = data.rotation?.quaternion || data.quaternion;
      if (qq && typeof qq.x === "number") {
        setPose({ q: { x: qq.x, y: qq.y, z: qq.z, w: qq.w }, ts: Date.now() });
      }
    });
    return () => { sub && sub.remove(); };
  }, []);

  return pose;
}
