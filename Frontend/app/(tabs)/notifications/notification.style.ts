import { StyleSheet } from "react-native";
import { Colors } from "@/constants/Colors";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  header: {
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  title: {
    color: Colors.text,
    fontSize: 28,
    fontWeight: "800",
  },
  subtitle: {
    color: "#B6B6B6",
    fontSize: 14,
    marginTop: 4,
  },
  loadingWrap: {
    alignItems: "center",
    marginTop: 24,
  },
  emptyWrap: {
    alignItems: "center",
    marginTop: 32,
    paddingHorizontal: 16,
  },
  emptyText: {
    color: "#9CA3AF",
    fontSize: 14,
  },
  listContent: {
  },
});
