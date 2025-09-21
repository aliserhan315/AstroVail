import React, { JSX } from "react";
import { View, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter, usePathname, type Href } from "expo-router";
import { Home, Star, Calendar, Gift, User } from "lucide-react-native";

import TabBarItem from "../TabBarItem/TabBarItem";
import { styles, BAR_HEIGHT,  ACTIVE_BG, ACTIVE_ICON, INACTIVE_ICON } from "./TabBar.style";

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
      style={[
        styles.bar,
        {
          height: BAR_HEIGHT,
          paddingBottom: Platform.select({
            ios: 12 + insets.bottom,
            android: 12 + insets.bottom,
            default: 12,
          }),
        },
      ]}
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
