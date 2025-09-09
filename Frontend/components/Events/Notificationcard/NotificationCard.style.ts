
import { StyleSheet } from "react-native";
import { Colors } from "@/constants/Colors";
export const styles = StyleSheet.create({
  card: {
    backgroundColor: "rgba(21, 58, 160, 0.28)",
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
    marginHorizontal: 16,
    marginVertical: 8,
  },
  rowTop: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  title: {
    flex: 1,
    color: Colors.text,
    fontSize: 16,
    fontWeight: "600",
  },
  rightLabel: {
    color: Colors.text,
    opacity: 0.9,
    fontSize: 12,
    marginLeft: 8,
  },
  body: {
    color: Colors.text,
    opacity: 0.8,
    fontSize: 13,
    lineHeight: 18,
  },
});
