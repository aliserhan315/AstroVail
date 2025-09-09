import { StyleSheet } from "react-native";

export default StyleSheet.create({
  root: {
    marginBottom: 10,
  },
  closeBtn: {
    position: "absolute",
    right: 10,
    top: 10,
    height: 22,
    minWidth: 22,
    paddingHorizontal: 6,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.15)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.25)",
  },
  closeText: {
    color: "#fff",
  },
});
