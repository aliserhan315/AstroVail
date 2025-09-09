import { StyleSheet } from "react-native";

export default StyleSheet.create({
  root: {
    flexDirection: "row",
    borderRadius: 999,
    padding: 2,
    gap: 2,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.35)",
    backgroundColor: "transparent",
  },
  option: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
  },
  optionActive: { backgroundColor: "rgba(255,255,255,0.10)" },
  optionInactive: { backgroundColor: "transparent" },
  label: { color: "#fff", fontSize: 13, fontWeight: "600", opacity: 0.95 },
  labelActive: { opacity: 1 },
});
