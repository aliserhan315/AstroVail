import React from "react";
import { View } from "react-native";
import Segmented from "@/components/ui/Segmented";

interface GiftModeSelectorProps {
  mode: "gift" | "self";
  onModeChange: (mode: "gift" | "self") => void;
}

export default function GiftModeSelector({ mode, onModeChange }: GiftModeSelectorProps) {
  return (
    <View style={{ marginBottom: 16 }}>
      <Segmented
        options={[
          { label: "Buying as gift", value: "gift" },
          { label: "Buying for myself", value: "self" },
        ]}
        value={mode}
        onChange={(v) => onModeChange(v as "gift" | "self")}
      />
    </View>
  );
}
