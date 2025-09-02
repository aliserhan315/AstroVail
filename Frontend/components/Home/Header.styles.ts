import { StyleSheet } from "react-native";

export default StyleSheet.create({
  wrap: {
    position: "absolute",
    left: 16,
    right: 16,
    top: 0,
    zIndex: 10,
    height: 56,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  brand: { color: "#FFFFFF", fontSize: 20, fontWeight: "800" },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.10)",
  },
});
