import { StyleSheet } from "react-native";

export default StyleSheet.create({
  card: {
    marginVertical: 6,
    borderRadius: 14,
    overflow: "hidden",
  },
  fill: {
    padding: 12,
    borderRadius: 14,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  emoji: {
    fontSize: 20,
    marginRight: 12,
  },
  name: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  meta: {
    color: "rgba(255, 255, 255, 0.7)",
    fontSize: 13,
    marginTop: 2,
  },
  coord: {
    color: "rgba(255, 255, 255, 0.8)",
    fontSize: 13,
  },
});
