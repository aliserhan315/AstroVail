import { DEG, wrap2pi, wrapPi } from "../math/astro";

export interface ProjectionResult {
  x: number | null;
  y: number | null;
  visible: boolean;
  azDiff: number; 
  altDiff: number; 
  angularDistance: number; 
}

export function calculateStarProjection(
  starAzAlt: { az: number; alt: number },
  deviceOrientation: { yaw: number; pitch: number; roll: number },
  screenW: number,
  screenH: number,
  fovXDeg: number = 70,
  calibrationOffset: number = 0
): ProjectionResult {
  const fovX = fovXDeg * DEG;
  const fovY = fovX * (screenH / screenW);

  const calibratedYaw = wrap2pi(deviceOrientation.yaw + calibrationOffset * DEG);

  const azDiff = wrapPi(starAzAlt.az - calibratedYaw);
  const altDiff = starAzAlt.alt - deviceOrientation.pitch;
  const withinFOV = Math.abs(azDiff) <= fovX / 2 && Math.abs(altDiff) <= fovY / 2;

  let screenX: number | null = null;
  let screenY: number | null = null;

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
    angularDistance: Math.sqrt(azDiff * azDiff + altDiff * altDiff),
  };
}