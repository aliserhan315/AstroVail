import React from "react";
import { View } from "react-native";
import { styles } from "./StarMarker.styles";

interface StarMarkerProps {
  x: number;
  y: number;
}

export default function StarMarker({ x, y }: StarMarkerProps) {
  return (
    <View
      style={[
        styles.container,
        {
          left: x - 20,
          top: y - 20,
        }
      ]}
    >
      <View style={styles.starDot} />
      <View style={styles.starPulse} />
    </View>
  );
}
