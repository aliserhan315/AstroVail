import React, { useMemo } from "react";
import { View } from "react-native";
import { Slot, usePathname } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import TabBar from "../../components/nav/TabBar";

const BAR_HEIGHT = 77;

export default function FixedTabsLayout() {
  const pathname = usePathname();
  const insets = useSafeAreaInsets();

  const hideBar = useMemo(() => {
    return pathname.startsWith("/(tabs)/star/") || pathname.startsWith("/(tabs)/(star)/");
  }, [pathname]);

  const contentBottomPad = BAR_HEIGHT + (insets.bottom || 0);

  return (
    <View style={{ flex: 1, backgroundColor: "#000" }}>
      <View style={{ flex: 1, paddingBottom: hideBar ? 0 : contentBottomPad }}>
        <Slot />
      </View>
      {!hideBar && <TabBar />}
    </View>
  );
}
