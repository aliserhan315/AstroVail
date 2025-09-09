import { StyleSheet } from "react-native";

export default StyleSheet.create({
  wrap: {
    backgroundColor: "rgba(32,76,182,0.9)",
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: 10,
    overflow: "hidden",
  },
  topRow: { flexDirection: "row", alignItems: "center" },
  name: { color: "#fff", fontSize: 16, fontWeight: "700", flex: 1 },
  metaRight: { color: "rgba(255,255,255,0.92)", fontSize: 12 },
  sub: { color: "rgba(255,255,255,0.9)", fontSize: 12, marginTop: 4 },
  close: {
    marginLeft: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.18)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.35)",
  },
  closeText: { color: "#fff", fontSize: 12, fontWeight: "700" },
});
