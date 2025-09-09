import { StyleSheet } from "react-native";

export default StyleSheet.create({
  wrap: {
    marginHorizontal: 20,
    marginTop: 12,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.10)",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
  },
  icon: { marginRight: 6 },
  input: {
    flex: 1,
    color: "#FFFFFF",
    fontSize: 16,
    paddingVertical: 0,
  },
  clearBtn: { paddingLeft: 6, paddingVertical: 6 },
});
