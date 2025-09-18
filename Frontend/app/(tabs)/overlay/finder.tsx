import React, { useCallback, useEffect, useMemo,  useState } from "react";
import { View, Text, TouchableOpacity, LayoutChangeEvent, StyleSheet, Platform } from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import * as Location from "expo-location";
import { DeviceMotion } from "expo-sensors";
import { useLocalSearchParams } from "expo-router";

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
  const gmst = 280.46061837 + 360.98564736629 * (jd - 2451545.0) + 0.000387933 * T * T - (T * T * T) / 38710000.0;
  return wrap2pi(gmst * DEG);
}

export function lstRad(d: Date, lonDeg: number) {
  return wrap2pi(gmstRad(d) + lonDeg * DEG);
}

export function radecToAzAlt(raDeg: number, decDeg: number, when: Date, latDeg: number, lonDeg: number) {
  const ra = raDeg * DEG;
  const dec = decDeg * DEG;
  const lst = lstRad(when, lonDeg);
  const H = wrapPi(lst - ra);
  const lat = latDeg * DEG;

  const sinAlt = Math.sin(dec) * Math.sin(lat) + Math.cos(dec) * Math.cos(lat) * Math.cos(H);
  const alt = Math.asin(Math.max(-1, Math.min(1, sinAlt)));
  
  const y = -Math.sin(H) * Math.cos(dec);
  const x = Math.sin(dec) - Math.sin(lat) * sinAlt;
  const az = wrap2pi(Math.atan2(y, x));

  return { az, alt };
}

// Enhanced device pose hook with better orientation handling
function useEnhancedDevicePose() {
  const [motionData, setMotionData] = useState<{
    yaw: number;
    pitch: number;
    roll: number;
    isReady: boolean;
  } | null>(null);
  const [permissionStatus, setPermissionStatus] = useState<"checking" | "granted" | "denied" | "unavailable">("checking");

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

        if (Platform.OS === "ios" && DeviceMotion.requestPermissionsAsync) {
          const { status } = await DeviceMotion.requestPermissionsAsync();
          if (mounted) {
            setPermissionStatus(status === "granted" ? "granted" : "denied");
          }
          if (status !== "granted") return;
        } else {
          if (mounted) setPermissionStatus("granted");
        }

        subscription = DeviceMotion.addListener((motionData) => {
          if (!mounted) return;

          const { rotation } = motionData;
          if (rotation) {
            const { alpha, beta, gamma } = rotation;
            
            let deviceYaw = alpha || 0;
            let devicePitch = beta || 0;
            let deviceRoll = gamma || 0;

            deviceYaw = wrap2pi(deviceYaw);
            devicePitch = Math.max(-Math.PI/2, Math.min(Math.PI/2, devicePitch));
            deviceRoll = wrapPi(deviceRoll);

            setMotionData({
              yaw: deviceYaw,
              pitch: devicePitch, 
              roll: deviceRoll,
              isReady: true
            });
          }
        });

      } catch (error) {
        console.error("Device motion setup error:", error);
        if (mounted) setPermissionStatus("unavailable");
      }
    };

    setup();

    return () => {
      mounted = false;
      if (subscription) {
        subscription.remove();
      }
    };
  }, []);

  return { 
    orientation: motionData, 
    status: permissionStatus 
  };
}

function calculateStarProjection(
  starAzAlt: { az: number; alt: number },
  deviceOrientation: { yaw: number; pitch: number; roll: number },
  screenW: number,
  screenH: number,
  fovXDeg: number = 70,
  calibrationOffset: number = 0
) {
  const fovX = fovXDeg * DEG;
  const fovY = fovX * (screenH / screenW);

  const calibratedYaw = wrap2pi(deviceOrientation.yaw + calibrationOffset * DEG);

  const azDiff = wrapPi(starAzAlt.az - calibratedYaw);
  const altDiff = starAzAlt.alt - deviceOrientation.pitch;
  const withinFOV = Math.abs(azDiff) <= fovX / 2 && Math.abs(altDiff) <= fovY / 2;

  let screenX = null;
  let screenY = null;

  if (withinFOV) {
    screenX = screenW / 2 + (azDiff / fovX) * screenW;
    screenY = screenH / 2 - (altDiff / fovY) * screenH;
  }

  return {
    x: screenX,
    y: screenY,
    visible: withinFOV,
    azDiff,
    altDiff,
    angularDistance: Math.sqrt(azDiff * azDiff + altDiff * altDiff)
  };
}

export default function LiveFinder() {
  const { starId } = useLocalSearchParams();
  const id = useMemo(() => (Array.isArray(starId) ? starId[0] : starId), [starId]);

  const [camPerm, requestCamPerm] = useCameraPermissions();
  const { orientation, status: motionStatus } = useEnhancedDevicePose();
  const [location, setLocation] = useState<{ lat: number; lon: number } | null>(null);
  const [star, setStar] = useState<{ raDeg: number; decDeg: number; name?: string } | null>(null);
  const [calibrationOffset, setCalibrationOffset] = useState<number>(0);
  const [screenDimensions, setScreenDimensions] = useState<{ width: number; height: number }>({
    width: 360,
    height: 640
  });

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
      
      try {
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
      } catch (error) {
        console.error("Error fetching star:", error);
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

    const { projection } = starCalculations;
    const { azDiff, altDiff, angularDistance } = projection;
    const azDiffDeg = Math.abs(azDiff * RAD);
    const altDiffDeg = Math.abs(altDiff * RAD);
    const totalDistanceDeg = angularDistance * RAD;
    if (totalDistanceDeg < 1) {
      return "🎯 Perfect! Star should be visible in viewfinder!";
    } else if (totalDistanceDeg < 3) {
      return "🔍 Very close! Look carefully for the star marker.";
    }
    let primaryDirection = "";
    let secondaryDirection = "";
    if (azDiffDeg > 2) {
      if (azDiffDeg > 15) {
        primaryDirection = azDiff > 0 ? "Turn RIGHT (large)" : "Turn LEFT (large)";
      } else if (azDiffDeg > 5) {
        primaryDirection = azDiff > 0 ? "Turn right" : "Turn left";
      } else {
        primaryDirection = azDiff > 0 ? "Turn right slightly" : "Turn left slightly";
      }
    }
  
    if (altDiffDeg > 2) {
      const verticalMsg = altDiff > 0 ? "Tilt UP" : "Tilt DOWN";
      if (altDiffDeg > 15) {
        secondaryDirection = `${verticalMsg} (large)`;
      } else if (altDiffDeg > 5) {
        secondaryDirection = verticalMsg;
      } else {
        secondaryDirection = `${verticalMsg} slightly`;
      }
    }
    if (primaryDirection && secondaryDirection) {
      return `${primaryDirection} & ${secondaryDirection} (${totalDistanceDeg.toFixed(1)}° away)`;
    } else if (primaryDirection) {
      return `${primaryDirection} (${totalDistanceDeg.toFixed(1)}° away)`;
    } else if (secondaryDirection) {
      return `${secondaryDirection} (${totalDistanceDeg.toFixed(1)}° away)`;
    }

    return `Getting closer... ${totalDistanceDeg.toFixed(1)}° away`;
  }, [star, location, motionStatus, orientation, starCalculations]);

  const onLayout = useCallback((event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;
    if (width && height) {
      setScreenDimensions({ width, height });
    }
  }, []);

  const adjustCalibration = useCallback((degrees: number) => {
    setCalibrationOffset(prev => prev + degrees);
  }, []);

  const resetCalibration = useCallback(() => {
    setCalibrationOffset(0);
  }, []);

  return (
    <View style={styles.container} onLayout={onLayout}>
      <View style={styles.cameraContainer}>
        <CameraView style={StyleSheet.absoluteFill} />
      </View>
      <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
        {starCalculations?.projection.visible && starCalculations.projection.x && starCalculations.projection.y && (
          <View
            style={[
              styles.starIndicator,
              {
                left: starCalculations.projection.x - 20,
                top: starCalculations.projection.y - 20,
              }
            ]}
          >
            <View style={styles.starDot} />
            <View style={styles.starPulse} />
          </View>
        )}
        <View style={styles.crosshair}>
          <View style={styles.crosshairHorizontal} />
          <View style={styles.crosshairVertical} />
          <View style={styles.centerDot} />
        </View>
        <View style={styles.hudContainer}>
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
              <Text style={styles.debugText}>
                Offset: {calibrationOffset}°
              </Text>
            </View>
          )}
        </View>

        <View style={styles.controlsContainer}>
          <TouchableOpacity style={styles.controlButton} onPress={() => adjustCalibration(-10)}>
            <Text style={styles.controlButtonText}>-10°</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.controlButton} onPress={() => adjustCalibration(-5)}>
            <Text style={styles.controlButtonText}>-5°</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={[styles.controlButton, styles.resetButton]} onPress={resetCalibration}>
            <Text style={styles.controlButtonText}>Reset</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.controlButton} onPress={() => adjustCalibration(5)}>
            <Text style={styles.controlButtonText}>+5°</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.controlButton} onPress={() => adjustCalibration(10)}>
            <Text style={styles.controlButtonText}>+10°</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "black",
  },
  cameraContainer: {
    flex: 1,
  },
  starIndicator: {
    position: "absolute",
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  starDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: "#00ff88",
    borderColor: "white",
    borderWidth: 2,
    position: "absolute",
    zIndex: 2,
  },
  starPulse: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderColor: "#00ff88",
    borderWidth: 2,
    position: "absolute",
    opacity: 0.6,
  },
  crosshair: {
    position: "absolute",
    top: "50%",
    left: "50%",
    marginTop: -20,
    marginLeft: -20,
    width: 40,
    height: 40,
  },
  crosshairHorizontal: {
    position: "absolute",
    top: 19,
    left: 5,
    width: 30,
    height: 2,
    backgroundColor: "rgba(255,255,255,0.8)",
  },
  crosshairVertical: {
    position: "absolute",
    top: 5,
    left: 19,
    width: 2,
    height: 30,
    backgroundColor: "rgba(255,255,255,0.8)",
  },
  centerDot: {
    position: "absolute",
    top: 17,
    left: 17,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "rgba(255,255,255,0.9)",
  },
  hudContainer: {
    position: "absolute",
    top: 60,
    left: 20,
    right: 20,
    backgroundColor: "rgba(0,0,0,0.85)",
    padding: 16,
    borderRadius: 12,
    borderColor: "rgba(255,255,255,0.2)",
    borderWidth: 1,
  },
  starName: {
    color: "#00ff88",
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 8,
  },
  guidanceText: {
    color: "white",
    fontSize: 16,
    textAlign: "center",
    marginBottom: 12,
    lineHeight: 22,
  },
  debugInfo: {
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.3)",
    paddingTop: 8,
    marginTop: 8,
  },
  debugText: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 11,
    fontFamily: Platform.select({ ios: "Menlo", android: "monospace" }),
    marginBottom: 2,
  },
  controlsContainer: {
    position: "absolute",
    bottom: 50,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
    paddingHorizontal: 20,
  },
  controlButton: {
    backgroundColor: "rgba(0,0,0,0.8)",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    borderColor: "rgba(255,255,255,0.3)",
    borderWidth: 1,
    minWidth: 50,
  },
  resetButton: {
    backgroundColor: "rgba(255,100,100,0.8)",
  },
  controlButtonText: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
    textAlign: "center",
  },
});