import React from "react";
import { View, Text, Pressable } from "react-native";
import { CertificateStyle } from "@/types/cart";
import styles from "../../app/(tabs)/gift/gift.styles";

interface CertificateStyleSelectorProps {
  selectedStyle: CertificateStyle;
  onStyleChange: (style: CertificateStyle) => void;
}

export default function CertificateStyleSelector({
  selectedStyle,
  onStyleChange,
}: CertificateStyleSelectorProps) {
  const activePill = {
    borderColor: "#9ddcff",
    backgroundColor: "rgba(157, 220, 255, 0.18)",
  };
  const activeText = { color: "#9ddcff" };

  const styleOptions = [
    { style: CertificateStyle.Classic, label: "Classic" },
    { style: CertificateStyle.Modern, label: "Modern" },
    { style: CertificateStyle.Cosmic, label: "Cosmic" },
  ];

  return (
    <View>
      <Text style={styles.sectionLabel}>Certificate style:</Text>
      <View style={styles.pillsRow}>
        {styleOptions.map(({ style, label }) => (
          <Pressable
            key={style}
            onPress={() => onStyleChange(style)}
            style={[
              styles.pill,
              selectedStyle === style && activePill,
            ]}
          >
            <Text
              style={[
                styles.pillText,
                selectedStyle === style && activeText,
              ]}
            >
              {label}
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}
