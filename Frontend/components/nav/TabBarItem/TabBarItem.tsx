import React, { JSX } from "react";
import { Pressable, Text } from "react-native";
import { styles } from "./TabBarItem.style";

type TabBarItemProps = {
  label: string;
  active: boolean;
  Icon: (props: { color: string }) => JSX.Element;
  onPress: () => void;
  activeBg: string;
  activeColor: string;
  inactiveColor: string;
};

export default function TabBarItem({
  label,
  active,
  Icon,
  onPress,
  activeBg,
  activeColor,
  inactiveColor,
}: TabBarItemProps) {
  const tint = active ? activeColor : inactiveColor;

  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.item,
        active && { backgroundColor: activeBg },
      ]}
    >
      <Icon color={tint} />
      <Text style={[styles.label, { color: tint, fontWeight: active ? "700" : "500" }]}>
        {label}
      </Text>
    </Pressable>
  );
}
