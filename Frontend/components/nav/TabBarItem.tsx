import React, { JSX } from "react";
import { Pressable, Text } from "react-native";

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
  return (
    <Pressable
      onPress={onPress}
      style={{
        width: 64,
        height: 64,
        borderRadius: 32,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: active ? activeBg : "transparent",
      }}
    >
      <Icon color={active ? activeColor : inactiveColor} />
      <Text
        style={{
          fontSize: 10,
          color: active ? activeColor : inactiveColor,
          fontWeight: active ? "700" : "500",
          marginTop: 4,
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
}
