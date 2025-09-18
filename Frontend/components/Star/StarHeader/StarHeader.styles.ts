import { StyleSheet } from "react-native";
import { Colors } from "@/constants/Colors";

export const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    marginBottom: 8
  },
  starEmoji: {
    fontSize: 36,
    marginBottom: 6
  },
  title: {
    color: Colors.text,
    fontSize: 28,
    fontWeight: "800"
  },
  constellation: {
    color: Colors.tint,
    fontSize: 14,
    marginTop: 4
  }
});