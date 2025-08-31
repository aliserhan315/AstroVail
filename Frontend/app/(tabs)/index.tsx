import React from "react";
import { View, Text, StyleSheet } from "react-native";

export default function HomeTab() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Home</Text>
      <Text style={styles.sub}>3D area & sky map will live here after onboarding.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0B0F1A", alignItems: "center", justifyContent: "center" },
  title: { color: "#FFFFFF", fontSize: 28, fontWeight: "800" },
  sub: { color: "#CBD5E1", marginTop: 8 },
});