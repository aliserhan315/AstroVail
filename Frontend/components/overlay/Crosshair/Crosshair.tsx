import React from "react";
import { View } from "react-native";
import { styles } from "./Crosshair.style";

export default function Crosshair() {
  return (
    <View style={styles.container} pointerEvents="none">
      <View style={styles.horizontal} />
      <View style={styles.vertical} />
      <View style={styles.centerDot} />
    </View>
  );
}