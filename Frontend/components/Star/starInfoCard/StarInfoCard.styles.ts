import { StyleSheet } from "react-native";
import { Colors } from "@/constants/Colors";

export  const styles = StyleSheet.create({
  title: { color: Colors.text, fontSize: 18, fontWeight: "700", marginBottom: 8 },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 7, marginBottom: 8 },
  caption: { color: Colors.text, fontSize: 12, marginTop: 6, lineHeight: 18 },
});
