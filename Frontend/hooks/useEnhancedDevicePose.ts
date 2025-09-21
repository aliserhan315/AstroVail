import { useEffect, useState } from "react";
import { DeviceMotion } from "expo-sensors";
import { Platform } from "react-native";
import { wrap2pi, wrapPi } from "@/lib/math/astro";

export function useEnhancedDevicePose() {
  const [motionData, setMotionData] = useState<{
    yaw: number;
    pitch: number;
    roll: number;
    isReady: boolean;
  } | null>(null);
  
  const [permissionStatus, setPermissionStatus] = useState<
    "checking" | "granted" | "denied" | "unavailable"
  >("checking");

  useEffect(() => {
    let subscription: any = null;
    let mounted = true;

    const setup = async () => {
      try {
        const available = await DeviceMotion.isAvailableAsync();
        
        if (!available) {
          if (mounted) setPermissionStatus("unavailable");
          return;
        }

        if (Platform.OS === "ios" && (DeviceMotion as any).requestPermissionsAsync) {
          const { status } = await (DeviceMotion as any).requestPermissionsAsync();
          if (mounted) setPermissionStatus(status === "granted" ? "granted" : "denied");
          if (status !== "granted") return;
        } else {
          if (mounted) setPermissionStatus("granted");
        }

        subscription = DeviceMotion.addListener((evt: any) => {
          if (!mounted) return;
          const { rotation } = evt;
          if (rotation) {
            const { alpha, beta, gamma } = rotation;
            let deviceYaw = alpha || 0;
            let devicePitch = beta || 0;
            let deviceRoll = gamma || 0;

            deviceYaw = wrap2pi(deviceYaw);
            devicePitch = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, devicePitch));
            deviceRoll = wrapPi(deviceRoll);

            setMotionData({ 
              yaw: deviceYaw, 
              pitch: devicePitch, 
              roll: deviceRoll, 
              isReady: true 
            });
          }
        });
      } catch (e) {
        console.error("Device motion setup error:", e);
        if (mounted) setPermissionStatus("unavailable");
      }
    };

    setup();
    return () => {
      mounted = false;
      if (subscription) subscription.remove();
    };
  }, []);

  return { orientation: motionData, status: permissionStatus } as const;
}