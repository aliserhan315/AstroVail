import React, { useCallback, useEffect, useMemo, useState } from "react";
import { View, Text, LayoutChangeEvent, StyleSheet } from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import * as Location from "expo-location";
import { useLocalSearchParams } from "expo-router";

import Crosshair from "@/components/overlay/Crosshair/Crosshair";
import ControlsBar from "@/components/overlay/ControlsBar/ControlsBar";
import StarMarker from "@/components/overlay/StarMarker/StarMarker";
import { useEnhancedDevicePose } from "@/hooks/useEnhancedDevicePose";
import { DEG, RAD, radecToAzAlt, wrap2pi } from "@/lib/math/astro";
import { calculateStarProjection } from "@/lib/utils/projection";
import { styles } from "./LiveFinder.styles";

export default function LiveFinder() {
  const { starId } = useLocalSearchParams();
  const id = useMemo(() => (Array.isArray(starId) ? starId[0] : starId), [starId]);

  const [camPerm, requestCamPerm] = useCameraPermissions();
  const { orientation, status: motionStatus } = useEnhancedDevicePose();
  const [location, setLocation] = useState<{ lat: number; lon: number } | null>(null);
  const [star, setStar] = useState<{ raDeg: number; decDeg: number; name?: string } | null>(null);
  const [calibrationOffset, setCalibrationOffset] = useState<number>(0);
  const [screenDimensions, setScreenDimensions] = useState({ width: 360, height: 640 });

  useEffect(() => {
    let cancelled = false;
    const setup = async () => {
      if (!camPerm?.granted) {
        await requestCamPerm();
      }

      const locPermission = await Location.requestForegroundPermissionsAsync();
      if (locPermission.status === "granted") {
        try {
          const pos = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced,
          });
          if (!cancelled) {
            setLocation({
              lat: pos.coords.latitude,
              lon: pos.coords.longitude
            });
          }
        } catch (error) {
          console.error("Location error:", error);
        }
      }
    };
    setup();
    return () => { cancelled = true; };
  }, [camPerm?.granted, requestCamPerm]);

  useEffect(() => {
    let mounted = true;
    const fetchStar = async () => {
      if (!id) return;

      const mockStarData = {
        ra: 310.9971589496829,
        dec: 17.57148832307207,
        displayName: "V* MY Del",
        baseName: "V* MY Del"
      };

      if (mounted) {
        setStar({
          raDeg: Number(mockStarData.ra),
          decDeg: Number(mockStarData.dec),
          name: mockStarData.displayName || mockStarData.baseName
        });
      }
    };
    fetchStar();
    return () => { mounted = false; };
  }, [id]);

  const starCalculations = useMemo(() => {
    if (!star || !location || !orientation?.isReady) return null;

    const now = new Date();
    const starAzAlt = radecToAzAlt(star.raDeg, star.decDeg, now, location.lat, location.lon);
    
    const projection = calculateStarProjection(
      starAzAlt,
      orientation,
      screenDimensions.width,
      screenDimensions.height,
      70,
      calibrationOffset
    );

    return {
      starAzAlt,
      projection,
      deviceOrientation: {
        yaw: wrap2pi(orientation.yaw + calibrationOffset * DEG),
        pitch: orientation.pitch,
        roll: orientation.roll
      }
    };
  }, [star, location, orientation, screenDimensions, calibrationOffset]);

  const guidanceMessage = useMemo(() => {
    if (!star) return "Loading star data...";
    if (!location) return "Getting GPS location...";
    if (motionStatus === "checking") return "Checking device sensors...";
    if (motionStatus === "unavailable") return "Motion sensors not available. Use physical device.";
    if (motionStatus === "denied") return "Please enable motion sensors in device settings.";
    if (!orientation?.isReady) return "Calibrating orientation sensors...";
    if (!starCalculations) return "Calculating star position...";

    const { azDiff, altDiff, angularDistance } = starCalculations.projection;
    const azDiffDeg = Math.abs(azDiff * RAD);
    const altDiffDeg = Math.abs(altDiff * RAD);
    const totalDistanceDeg = angularDistance * RAD;

    if (totalDistanceDeg < 1) return " Perfect! Star should be visible in viewfinder!";
    if (totalDistanceDeg < 3) return "Very close! Look carefully for the star marker.";

    let primary = "";
    let secondary = "";
    
    if (azDiffDeg > 2) {
      if (azDiffDeg > 15) primary = azDiff > 0 ? "Turn RIGHT (large)" : "Turn LEFT (large)";
      else if (azDiffDeg > 5) primary = azDiff > 0 ? "Turn right" : "Turn left";
      else primary = azDiff > 0 ? "Turn right slightly" : "Turn left slightly";
    }
    
    if (altDiffDeg > 2) {
      const vmsg = altDiff > 0 ? "Tilt UP" : "Tilt DOWN";
      if (altDiffDeg > 15) secondary = `${vmsg} (large)`;
      else if (altDiffDeg > 5) secondary = vmsg;
      else secondary = `${vmsg} slightly`;
    }
    
    if (primary && secondary) return `${primary} & ${secondary} (${totalDistanceDeg.toFixed(1)}° away)`;
    if (primary) return `${primary} (${totalDistanceDeg.toFixed(1)}° away)`;
    if (secondary) return `${secondary} (${totalDistanceDeg.toFixed(1)}° away)`;
    return `Getting closer... ${totalDistanceDeg.toFixed(1)}° away`;
  }, [star, location, motionStatus, orientation, starCalculations]);

  const onLayout = useCallback((event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;
    if (width && height) {
      setScreenDimensions({ width, height });
    }
  }, []);

  return (
    <View style={styles.container} onLayout={onLayout}>
      <View style={styles.cameraContainer}>
        <CameraView style={StyleSheet.absoluteFill} />
      </View>

      <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
        {starCalculations?.projection.visible && 
         starCalculations.projection.x !== null && 
         starCalculations.projection.y !== null && (
          <StarMarker 
            x={starCalculations.projection.x} 
            y={starCalculations.projection.y} 
          />
        )}

        <Crosshair />

        <View style={styles.hudContainer} pointerEvents="none">
          <Text style={styles.starName}>{star?.name || "Target Star"}</Text>
          <Text style={styles.guidanceText}>{guidanceMessage}</Text>
          
          {starCalculations && (
            <View style={styles.debugInfo}>
              <Text style={styles.debugText}>
                Device: Az {(starCalculations.deviceOrientation.yaw * RAD).toFixed(1)}°, Alt {(starCalculations.deviceOrientation.pitch * RAD).toFixed(1)}°
              </Text>
              <Text style={styles.debugText}>
                Target: Az {(starCalculations.starAzAlt.az * RAD).toFixed(1)}°, Alt {(starCalculations.starAzAlt.alt * RAD).toFixed(1)}°
              </Text>
              <Text style={styles.debugText}>Offset: {calibrationOffset}°</Text>
            </View>
          )}
        </View>

        <ControlsBar 
          onAdjust={(degrees) => setCalibrationOffset(prev => prev + degrees)} 
          onReset={() => setCalibrationOffset(0)} 
        />
      </View>
    </View>
  );
}