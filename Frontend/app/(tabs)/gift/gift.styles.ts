import { StyleSheet } from "react-native";
import { Colors } from "@/constants/Colors";

export default StyleSheet.create({
  scroll: {},
  header: { paddingHorizontal: 16, marginBottom: 10 },
  h1: { color: Colors.text, fontSize: 28, fontWeight: "800" },
  h2: { color: "rgba(255,255,255,0.85)", marginTop: 6 },
  card: {
    backgroundColor: "rgba(21, 58, 160, 0.28)",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
    marginHorizontal: 16,
    marginTop: 8,
  },
  rowBetween: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 14,
    marginBottom: 8,
  },
  rowLabel: { color: Colors.text, fontSize: 14, opacity: 0.95, flex: 1 },
  addMoreBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.35)",
    backgroundColor: "transparent",
  },
  addMoreText: { color: Colors.text, fontSize: 12, fontWeight: "600" },
  pillsRow: { flexDirection: "row", gap: 10, marginTop: 10 },
  pill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.35)",
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  pillText: { color: "#fff", fontSize: 13, fontWeight: "600" },
  sectionLabel: { color: Colors.text, fontWeight: "700", marginTop: 16, marginBottom: 4 },
  cta: { marginTop: 18 },
});
