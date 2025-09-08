import React, { PropsWithChildren } from "react";
import { StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Colors } from "@/constants/Colors";
import { cardBase } from "./cardTheme";

type Props = PropsWithChildren<{ style?: any; title?: string; header?: React.ReactNode }>;

export default function SectionCard({ children, style }: Props) {
  return (
    <LinearGradient
      colors={[Colors.cardTop, Colors.cardBottom]}
      start={{ x: 0.5, y: 0 }}
      end={{ x: 0.5, y: 1 }}
      style={[styles.card, style]}
    >
      {children}
    </LinearGradient>
  );
}


const styles= StyleSheet.create({
  card: { ...cardBase },
});
