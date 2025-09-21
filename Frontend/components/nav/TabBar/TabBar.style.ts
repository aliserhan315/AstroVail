import { Platform, StyleSheet } from "react-native";

export const BG = "#0B0F1A";
export const ACTIVE_ICON = "#3B6BFF";
export const INACTIVE_ICON = "rgba(255,255,255,0.60)";
export const ACTIVE_BG = "rgba(59,107,255,0.28)";
export const BAR_HEIGHT = Platform.select({ ios: 86, android: 76, default: 72 }) as number;

export const styles = StyleSheet.create({
  bar: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: BG,
    borderTopColor: "transparent",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    paddingTop: 8,
  },
});
