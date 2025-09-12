import React, { JSX } from "react";
import { View, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter, usePathname } from "expo-router";

import TabBarItem from "./TabBarItem";
import { Home, Star, Calendar, Gift, User } from "lucide-react-native";
import type { Href } from "expo-router";

const BG = "#0B0F1A";
const ACTIVE_ICON = "#3B6BFF";
const INACTIVE_ICON = "rgba(255,255,255,0.60)";
const ACTIVE_BG = "rgba(59,107,255,0.28)";
const BAR_HEIGHT = Platform.select({ ios: 86, android: 76, default: 72 });

type NavItem = {
  key: string;
  label: string;
  href: Href;
  match: RegExp;
  Icon: (props: { color: string }) => JSX.Element;
};

const NAV_ITEMS: NavItem[] = [
  {
    key: "home",
    label: "Home",
    href: "/(tabs)",
    match: /^\/\(tabs\)\/?$/,
    Icon: ({ color }) => <Home color={color} size={20} />,
  },
  {
    key: "stars",
    label: "Stars",
    href: "/(tabs)/Stars",
    match: /^\/\(tabs\)\/stars/,
    Icon: ({ color }) => <Star color={color} size={20} />,
  },
  {
    key: "events",
    label: "Events",
    href: "/(tabs)/events",
    match: /^\/\(tabs\)\/events/,
    Icon: ({ color }) => <Calendar color={color} size={20} />,
  },
  {
    key: "gift",
    label: "Gift",
    href: "/(tabs)/gift",
    match: /^\/\(tabs\)\/gift/,
    Icon: ({ color }) => <Gift color={color} size={20} />,
  },
  {
    key: "profile",
    label: "Profile",
    href: "/(tabs)/profile",
    match: /^\/\(tabs\)\/profile/,
    Icon: ({ color }) => <User color={color} size={20} />,
  },
];

export default function TabBar() {
  const pathname = usePathname();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: BG,
        borderTopColor: "transparent",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-around",
        height: BAR_HEIGHT,
        paddingTop: 8,
        paddingBottom: Platform.select({
          ios: 12 + insets.bottom,
          android: 12 + insets.bottom,
          default: 12,
        }),
      }}
    >
      {NAV_ITEMS.map((item) => {
        const isActive = item.match.test(pathname);
        return (
          <TabBarItem
            key={item.key}
            label={item.label}
            active={isActive}
            Icon={item.Icon}
            onPress={() => router.push(item.href)}
            activeBg={ACTIVE_BG}
            activeColor={ACTIVE_ICON}
            inactiveColor={INACTIVE_ICON}
          />
        );
      })}
    </View>
  );
}
