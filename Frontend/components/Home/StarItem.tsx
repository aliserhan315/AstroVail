import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import styles from "./StarItem.styles";
import { COLORS } from "../theme/Colors";

export type Star = {
  id: string;
  name: string;
  mag: string;
  ra: string;
  dec: string;
  constellation?: string;
};

function hexToRgba(hex: string, alpha = 1) {
  const h = hex.replace("#", "");
  const bigint = parseInt(h, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `rgba(${r},${g},${b},${alpha})`;
}

export default function StarItem({ star, onPress }: { star: Star; onPress?: (s: Star) => void }) {
  const isVega = star.name?.toLowerCase() === "vega";
  const vegaFlat = hexToRgba("#052A93", 0.6); // 60% opacity

  const colors = isVega
    ? [vegaFlat, vegaFlat] // flat tint for Vega
    : [COLORS.starGradA, COLORS.starGradB];

  return (
    <TouchableOpacity activeOpacity={0.9} style={styles.card} onPress={() => onPress?.(star)}>
      <LinearGradient colors={colors} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.fill}>
        <View style={styles.row}>
          <Text style={styles.emoji}>✨</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.name}>{star.name}</Text>
            <Text style={styles.meta}>
              Mag {star.mag} · {star.constellation ?? "—"}
            </Text>
          </View>

          <View style={{ alignItems: "flex-end" }}>
            <Text style={styles.coord}>RA {star.ra}</Text>
            <Text style={styles.coord}>DEC {star.dec}</Text>
          </View>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
}
