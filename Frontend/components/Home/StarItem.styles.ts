import { StyleSheet } from "react-native";

export default StyleSheet.create({
  card: {
    marginHorizontal: 20,
    marginTop: 10,
    borderRadius: 16,
    overflow: "hidden",
  },
  fill: { paddingVertical: 14, paddingHorizontal: 14 },
  row: { flexDirection: "row", alignItems: "center", gap: 10 },
  emoji: { fontSize: 18 },
  name: { color: "#FFFFFF", fontWeight: "800", fontSize: 16, marginBottom: 2 },
  meta: { color: "rgba(255,255,255,0.9)", fontSize: 13 },
  coord: { color: "rgba(255,255,255,0.9)", fontSize: 12 },
});
