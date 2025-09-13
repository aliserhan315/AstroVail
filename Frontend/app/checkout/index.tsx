import React, { useEffect } from "react";
import { View, Text } from "react-native";
import { useRouter } from "expo-router";
import { CheckoutAPI } from "@/lib/endpoint";

export default function CheckoutScreen() {
  const router = useRouter();
  useEffect(() => {
    (async () => {
      try {
        await CheckoutAPI.create();
      } catch {}
      // Always return user home; order is finalized server-side
      router.replace("/(tabs)");
    })();
  }, [router]);

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#000" }}>
      <Text style={{ color: "#fff" }}>Finalizing your purchase...</Text>
    </View>
  );
}
