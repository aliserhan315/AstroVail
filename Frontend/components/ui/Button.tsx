import React from "react";
import { Pressable, Text, ActivityIndicator, ViewStyle } from "react-native";
import { ButtonVariant } from "@/types/ui";

export default function Button({
  title,
  onPress,
  loading,
  disabled,
  variant = ButtonVariant.Primary,
  style,
}: {
  title: string;
  onPress?: () => void;
  loading?: boolean;
  disabled?: boolean;
  variant?: ButtonVariant;
  style?: ViewStyle;
}) {
  const bg =
    variant === ButtonVariant.Primary ? "rgba(5, 42, 147, 0.9)" :
    variant === ButtonVariant.Success ? "rgba(88, 214, 141, 0.92)" :
    "transparent";
  const border =
    variant === ButtonVariant.Ghost ? "rgba(255,255,255,0.2)" : "transparent";
  const textColor = variant === ButtonVariant.Success ? "#0b2016" : "#fff";

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={[
        {
          paddingVertical: 10,
          paddingHorizontal: 14,
          borderRadius: 12,
          backgroundColor: bg,
          borderWidth: 1,
          borderColor: border,
          opacity: disabled || loading ? 0.7 : 1,
          alignItems: "center",
          justifyContent: "center",
          minHeight: 40,
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator size="small" color="#fff" />
      ) : (
        <Text style={{ color: textColor, fontSize: 14, fontWeight: "600" }}>{title}</Text>
      )}
    </Pressable>
  );
}
