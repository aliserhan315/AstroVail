import React from "react";
import { View, Text, StatusBar } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Background from "@/components/Background";
import { Colors } from "@/constants/Colors";

export default function ExploreScreen() {
  const insets = useSafeAreaInsets();
  return (
    <View style={{ flex: 1, backgroundColor: "#000" }}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      <Background />
      <View style={{ paddingTop: insets.top + 12, paddingHorizontal: 16 }}>
        <Text style={{ color: Colors.text, fontSize: 28, fontWeight: "800" }}>
          Explore
        </Text>
        <Text style={{ color: "#B6B6B6", fontSize: 14, marginTop: 4 }}>
          (Map coming soon)
        </Text>
      </View>
    </View>
  );
}
