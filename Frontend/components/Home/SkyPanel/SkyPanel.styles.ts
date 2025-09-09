import { StyleSheet } from "react-native";
import { COLORS } from "../theme/Colors";

export default StyleSheet.create({
  card: {
    marginHorizontal: 20,
    marginTop: 16,
    borderRadius: 18,
    overflow: "hidden",
    backgroundColor: "rgba(255,255,255,0.04)",
  },
  fill: { height: 220 },

  dot: {
    position: "absolute",
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#FFFFFF",
  },

  countBadge: {
    position: "absolute",
    top: 10,
    left: 10,
    backgroundColor: "rgba(0,0,0,0.55)",
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  countText: { color: "#fff", fontWeight: "800", fontSize: 12 },

  // bottom toolbar
  toolbar: {
    position: "absolute",
    left: 12,
    right: 12,
    bottom: 12,
    borderRadius: 12,
    backgroundColor: "rgba(0,0,0,0.55)",
    paddingVertical: 8,
    paddingHorizontal: 8,
  },
  toolbarRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  pill: {
    flexDirection: "row",
    gap: 6,
    backgroundColor: COLORS.pillBg,
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 10,
    alignItems: "center",
  },
  pillText: { color: COLORS.pillText, fontSize: 12, fontWeight: "700" },
});
