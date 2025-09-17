import React, { useEffect, useRef } from "react";
import { Animated, Text, ViewStyle } from "react-native";

type Props = {
  text: string;
  durationMs?: number;
  onHide?: () => void;
  style?: ViewStyle;
};

export default function ErrorMessage({ text, durationMs = 3500, onHide, style }: Props) {
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.timing(opacity, { toValue: 1, duration: 180, useNativeDriver: true }),
      Animated.delay(durationMs),
      Animated.timing(opacity, { toValue: 0, duration: 300, useNativeDriver: true }),
    ]).start(() => onHide && onHide());
  }, [durationMs, onHide, opacity]);

  return (
    <Animated.View
      style={[
        {
          opacity,
          position: "absolute",
          left: 16,
          right: 16,
          top: 16,
          backgroundColor: "#dc2626", // red-600
          borderRadius: 10,
          paddingVertical: 10,
          paddingHorizontal: 14,
          shadowColor: "#000",
          shadowOpacity: 0.2,
          shadowRadius: 6,
          shadowOffset: { width: 0, height: 3 },
          elevation: 2,
        },
        style,
      ]}
    >
      <Text style={{ color: "#fff", fontSize: 14, fontWeight: "600" }}>{text}</Text>
    </Animated.View>
  );
}

