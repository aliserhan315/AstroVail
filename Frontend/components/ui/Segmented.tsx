import React from "react";
import { View, Text, Pressable } from "react-native";

export type SegmentedOption<T = string> = { label: string; value: T };

export default function Segmented<T = string>({
  options,
  value,
  onChange,
}: {
  options: SegmentedOption<T>[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <View
      style={{
        flexDirection: "row",
        backgroundColor: "rgba(255,255,255,0.08)",
        borderRadius: 999,
        padding: 2,
        gap: 2,
      }}
    >
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <Pressable
            key={String(opt.value)}
            onPress={() => onChange(opt.value)}
            style={{
              flex: 1,
              paddingVertical: 10,
              borderRadius: 999,
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: active ? "#1E3A8A" : "transparent",
              borderWidth: 1,
              borderColor: active ? "rgba(255,255,255,0.2)" : "transparent",
            }}
            android_ripple={{ color: "rgba(255,255,255,0.12)" } as any}
          >
            <Text style={{ color: "#fff", fontSize: 13, fontWeight: "600", opacity: active ? 1 : 0.9 }}>
              {opt.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
