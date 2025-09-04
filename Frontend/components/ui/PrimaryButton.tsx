import React from "react";
import { Pressable, StyleSheet, Text } from "react-native";
import { Colors } from "@/constants/Colors";

export default function PrimaryButton({
  text,
  onPress,
  variant = "primary",
  style,
}: {
  text: string;
  onPress: () => void;
  variant?: "primary" | "secondary";
  style?: any;
}) {
  return (
    <Pressable onPress={onPress} style={[styles.button, variant === "secondary" && styles.secondary, style]}>
      <Text style={styles.text}>{text}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: Colors.primary,
    borderRadius: 28,
    paddingVertical: 12,
    alignItems: "center",
    shadowOpacity: 0.25,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  secondary: { backgroundColor: Colors.secondary },
  text: { color: Colors.onPrimary, fontWeight: "700", fontSize: 16 },
});
