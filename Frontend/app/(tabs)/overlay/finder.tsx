import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { View, Text, TouchableOpacity, LayoutChangeEvent, StyleSheet, Platform } from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import * as Location from "expo-location";
import { DeviceMotion } from "expo-sensors";
import { useLocalSearchParams } from "expo-router";
import { useDevicePose } from "@/lib/utils/useDevicePose";
import { projectStarField } from "@/lib/utils/sky";
import { StarsAPI } from "@/lib/endpoint";
import { radecToAzAlt, DEG, wrap2pi, wrapPi } from "@/lib/math/astro";
import { toObjQ } from "@/lib/math/quat";

export default function LiveFinder() {
  const { starId } = useLocalSearchParams();
  const id = useMemo(() => (Array.isArray(starId) ? (starId as string[])[0] : (starId as string)), [starId]);

  const [camPerm, requestCamPerm] = useCameraPermissions();
  const [motionOK, setMotionOK] = useState<"checking" | "granted" | "denied" | "unavailable">("checking");
  const [lat, setLat] = useState<number | null>(null);
  const [lon, setLon] = useState<number | null>(null);
  const [star, setStar] = useState<{ raDeg: number; decDeg: number; name?: string } | null>(null);
  const [yawOffset, setYawOffset] = useState<number>(0);

  const pose = useDevicePose();
  const now = useRef(new Date());

  const [vw, setVw] = useState<number>(360);
  const [vh, setVh] = useState<number>(640);
  const onLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    if (width && height) { setVw(width); setVh(height); }
  };

  const fovXdeg = 70;

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!camPerm?.granted) await requestCamPerm();

      const loc = await Location.requestForegroundPermissionsAsync();
      if (loc.status === "granted") {
        const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
        if (!cancelled) { setLat(pos.coords.latitude); setLon(pos.coords.longitude); }
      }

      const available = await DeviceMotion.isAvailableAsync().catch(() => false);
      if (!available) { if (!cancelled) setMotionOK("unavailable"); return; }

      if (Platform.OS === "ios" && DeviceMotion.requestPermissionsAsync) {
        const { status } = await DeviceMotion.requestPermissionsAsync();
        if (!cancelled) setMotionOK(status === "granted" ? "granted" : "denied");
      } else {
        if (!cancelled) setMotionOK("granted");
      }
    })();
    return () => { cancelled = true; };
  }, [camPerm?.granted, requestCamPerm]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!id) return;
      try {
        const s = await StarsAPI.get(String(id));
        const raDeg = Number(s.ra);
        const decDeg = Number(s.dec);
        if (mounted) setStar({ raDeg, decDeg, name: s.displayName || s.name });
      } catch {}
    })();
    return () => { mounted = false; };
  }, [id]);

  const projection = useMemo(() => {
    if (!star || !pose?.q || lat == null || lon == null) return null;
    now.current = new Date();
    const pts = projectStarField({
      stars: [{ id: 1, raDeg: star.raDeg, decDeg: star.decDeg, mag: 1, name: star.name }],
      when: now.current,
      lat,
      lon,
      yawOffsetDeg: yawOffset,
      screenW: vw,
      screenH: vh,
      fovXdeg,
      deviceQuat: toObjQ(pose.q as any),
    });
    return pts[0] || null;
  }, [star, pose?.q, lat, lon, yawOffset, vw, vh]);

  const steerMsg = useMemo(() => {
    if (!star) return "Loading star…";
    if (lat == null || lon == null) return "Waiting for location…";
    if (motionOK !== "granted") {
      if (motionOK === "checking") return "Checking motion permission…";
      if (motionOK === "unavailable") return "Motion unavailable. Use a dev build on device.";
      return "Enable Motion access in Settings.";
    }
    if (!pose?.q) return "Acquiring orientation…";

    const when = new Date();
    const tgt = radecToAzAlt(star.raDeg, star.decDeg, when, lat, lon);

    const { x, y, z, w } = toObjQ(pose.q as any);
    const yaw = Math.atan2(2 * (w * z + x * y), 1 - 2 * (y * y + z * z));
    const pitch = Math.asin(Math.max(-1, Math.min(1, 2 * (w * y - z * x))));

    const az = wrap2pi(yaw + yawOffset * DEG);
    const alt = pitch;

    const dAz = wrapPi(tgt.az - az);
    const dAlt = tgt.alt - alt;

    const azTh = 2.5 * DEG;
    const altTh = 2.0 * DEG;

    if (Math.abs(dAz) > azTh && Math.abs(dAz) > Math.abs(dAlt)) return dAz > 0 ? "Turn right" : "Turn left";
    if (Math.abs(dAlt) > altTh) return dAlt > 0 ? "Tilt up" : "Tilt down";
    return "Hold steady";
  }, [star, pose?.q, lat, lon, yawOffset, motionOK]);

  const adjustYaw = useCallback((d: number) => setYawOffset(v => v + d), []);

  return (
    <View style={styles.root} onLayout={onLayout}>
      <View style={styles.cameraWrap}>
        <CameraView style={StyleSheet.absoluteFill} />
      </View>

      <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
        {projection && (
          <View style={[styles.dot, { left: projection.x - 10, top: projection.y - 10 }]} />
        )}

        <View style={styles.hud}>
          <Text style={styles.hudTitle}>{star?.name || "Target"}</Text>
          <Text style={styles.hudText}>{steerMsg}</Text>
        </View>

        <View style={styles.controls}>
          <TouchableOpacity onPress={() => adjustYaw(-5)} style={styles.btn}><Text style={styles.btnText}>Yaw -5°</Text></TouchableOpacity>
          <TouchableOpacity onPress={() => adjustYaw(5)} style={styles.btn}><Text style={styles.btnText}>Yaw +5°</Text></TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "black" },
  cameraWrap: { flex: 1 },
  hud: { position: "absolute", left: 16, right: 16, top: 16, padding: 10, borderRadius: 10, backgroundColor: "rgba(0,0,0,0.55)" },
  hudTitle: { color: "#fff", fontWeight: "700" },
  hudText: { color: "#ddd" },
  controls: { position: "absolute", bottom: 28, left: 0, right: 0, flexDirection: "row", justifyContent: "center", gap: 16 },
  btn: { paddingVertical: 10, paddingHorizontal: 16, backgroundColor: "rgba(0,0,0,0.6)", borderRadius: 8, marginHorizontal: 8 },
  btnText: { color: "#fff" },
  dot: { position: "absolute", width: 20, height: 20, borderRadius: 10, backgroundColor: "#22d3ee", borderColor: "white", borderWidth: 2 },
});
