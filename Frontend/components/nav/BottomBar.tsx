import React, { JSX } from "react";
import { View, Pressable, Platform } from "react-native";
import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { Home, Search, Calendar, Gift, User } from "lucide-react-native";

const BG = "#0B0F1A";
const ACTIVE_ICON = "#3B6BFF";
const INACTIVE_ICON = "rgba(255,255,255,0.55)";
const ACTIVE_BG = "rgba(59,107,255,0.28)";
const ICON_SIZE = 24;

const ICONS: Record<string, (props: { color: string }) => JSX.Element> = {
  index:   ({ color }) => <Home     size={ICON_SIZE} color={color} strokeWidth={2.2} />,
  stars:   ({ color }) => <Search   size={ICON_SIZE} color={color} strokeWidth={2.2} />,
  events:  ({ color }) => <Calendar size={ICON_SIZE} color={color} strokeWidth={2.2} />,
  gift:    ({ color }) => <Gift     size={ICON_SIZE} color={color} strokeWidth={2.2} />,
  profile: ({ color }) => <User     size={ICON_SIZE} color={color} strokeWidth={2.2} />,
};

export default function BottomBar(props: BottomTabBarProps) {
  const { state, navigation, descriptors } = props;

  const routes = state.routes
    .filter((r) => {
      const opts = (descriptors[r.key]?.options ?? {}) as any;
      return opts?.href !== null; 
    })
    .filter((r) => {
      const hasIcon = Boolean(ICONS[r.name]);
      if (!hasIcon) console.warn("No icon mapped for tab:", r.name);
      return hasIcon;
    });

  return (
    <View
      style={{
        backgroundColor: BG,
        borderTopColor: "transparent",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-around",
        height: Platform.select({ ios: 86, android: 76, default: 72 }),
        paddingTop: 8,
        paddingBottom: Platform.select({ ios: 16, android: 12, default: 12 }),
      }}
    >
      {routes.map((route) => {
        const isFocused = state.index === state.routes.findIndex((rr) => rr.key === route.key);
        const Icon = ICONS[route.name];
        const color = isFocused ? ACTIVE_ICON : INACTIVE_ICON;

        const onPress = () => {
          const event = navigation.emit({
            type: "tabPress",
            target: route.key,
            canPreventDefault: true,
          });
          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name as never);
          }
        };

        return (
          <Pressable
            key={route.key}
            accessibilityRole="button"
            accessibilityState={isFocused ? { selected: true } : {}}
            onPress={onPress}
            onLongPress={() => navigation.emit({ type: "tabLongPress", target: route.key })}
            style={{
              width: 64,
              height: 64,
              borderRadius: 32,
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: isFocused ? ACTIVE_BG : "transparent",
            }}
          >
            {Icon ? <Icon color={color} /> : null}
          </Pressable>
        );
      })}
    </View>
  );
}
