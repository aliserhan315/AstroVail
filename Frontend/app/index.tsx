import React, { useEffect } from "react";
import { View, ActivityIndicator, StyleSheet, Text } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter, useRootNavigationState } from "expo-router";

export default function IndexGate() {
  const router = useRouter();
  const navState = useRootNavigationState();

  useEffect(() => {
    if (!navState?.key) return;

    (async () => {
      const seen = await AsyncStorage.getItem("av_seen_onboarding");
      const token = await AsyncStorage.getItem("av_token");

      if (!seen) {
        router.replace({ pathname: "/onboarding" }); 
        return;
      }

      if (token) {
        router.replace({ pathname: "/(tabs)" }); 
      } else {
        router.replace({ pathname: "/(auth)/login" }); 
      }
    })();
  }, [navState?.key, router]);

  return (
    <View style={styles.center}>
      <ActivityIndicator size="large" />
      <Text style={styles.bootText}>Launching AstroVail…</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, backgroundColor: "#0B0F1A", alignItems: "center", justifyContent: "center" },
  bootText: { color: "#FFFFFF", marginTop: 8 },
});
