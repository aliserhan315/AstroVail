import { StyleSheet } from "react-native";
import { Colors } from "@/constants/Colors";

export default StyleSheet.create({
  label: { color: Colors.text, fontSize: 14, marginBottom: 8, fontWeight: "600" },
  field: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.28)",
    backgroundColor: "transparent",
    padding: 10,
  },
  input: { color: Colors.text, fontSize: 14, minHeight: 22 },
  inputMultiline: { minHeight: 96 },
  rightWrap: { alignItems: "flex-end", marginTop: 10 },
  rightBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.35)",
    backgroundColor: "transparent",
  },
  rightBtnText: { color: Colors.text, fontSize: 12, fontWeight: "600" },
});
