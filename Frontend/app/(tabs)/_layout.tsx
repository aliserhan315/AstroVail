import React, { useMemo } from "react";
import { View, Text, Pressable, Platform } from "react-native";
import { Slot, usePathname, useRouter } from "expo-router";
import type { Href } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const BG = "#0B0F1A";
const ACTIVE_ICON = "#3B6BFF";
const INACTIVE_ICON = "rgba(255,255,255,0.60)";
const ACTIVE_BG = "rgba(59,107,255,0.28)";
const BAR_HEIGHT = Platform.select({ ios: 86, android: 76, default: 72 });

type NavItem = {
  key: "home" | "stars" | "events" | "gift" | "profile";
  label: string;
  href: Href;
  match: RegExp;
  icon: string; 
};

const NAV: NavItem[] = [
  { key: "home",    label: "Home",    href: "/(tabs)",         match: /^\/\(tabs\)\/?$/,       icon: "🏠" },
  { key: "stars",   label: "Stars",   href: "/(tabs)/Stars",   match: /^\/\(tabs\)\/stars/,    icon: "🔭" },
  { key: "events",  label: "Events",  href: "/(tabs)/events",  match: /^\/\(tabs\)\/events/,   icon: "📅" },
  { key: "gift",    label: "Gift",    href: "/(tabs)/gift",    match: /^\/\(tabs\)\/gift/,     icon: "🎁" },
  { key: "profile", label: "Profile", href: "/(tabs)/profile", match: /^\/\(tabs\)\/profile/,  icon: "👤" },
];

export default function FixedTabsLayout() {
  const pathname = usePathname();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const hideBar = useMemo(() => {
    return pathname.startsWith("/(tabs)/star/")
        || pathname.startsWith("/(tabs)/(star)/");
  }, [pathname]);

  const contentBottomPad = (BAR_HEIGHT ?? 72) + (insets.bottom || 0);

  return (
    <View style={{ flex: 1, backgroundColor: "#000" }}>
      <View style={{ flex: 1, paddingBottom: hideBar ? 0 : contentBottomPad }}>
        <Slot />
      </View>

      {!hideBar && (
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
            paddingBottom: Platform.select({ ios: 12 + insets.bottom, android: 12 + insets.bottom, default: 12 }),
          }}
        >
          {NAV.map((item) => {
            const active = item.match.test(pathname);
            return (
              <Pressable
                key={item.key}
                onPress={() => router.push(item.href)}
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: 32,
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: active ? ACTIVE_BG : "transparent",
                }}
              >
                <Text style={{ fontSize: 20, marginBottom: 4 }}>
                  {item.icon}
                </Text>
                <Text
                  style={{
                    fontSize: 10,
                    color: active ? ACTIVE_ICON : INACTIVE_ICON,
                    fontWeight: active ? "700" : "500",
                  }}
                >
                  {item.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      )}
    </View>
  );
}
