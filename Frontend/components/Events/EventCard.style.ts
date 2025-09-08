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
    gap: 10,
  },
  rowInline: {
    flexDirection: "row",
    alignItems: "center",
  },

  title: {
    flex: 1,
    color: Colors.text,
    fontSize: 16,
    fontWeight: "600",
  },

  // "Set Reminder" button
  reminderBtn: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: Colors.primary,
  },
  reminderBtnDisabled: {
    opacity: 0.7,
  },
  reminderText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "500",
  },

  badge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "rgba(88,214,141,0.16)", 
    borderWidth: 1,
    borderColor: "rgba(88,214,141,0.35)",
  },
  badgeText: {
    color: "#58d68d",
    fontSize: 11,
    fontWeight: "600",
  },

  date: {
    color: Colors.text,
    opacity: 0.9,
    fontSize: 14,
    marginBottom: 4,
  },
  desc: {
    color: Colors.text,
    opacity: 0.8,
    fontSize: 13,
    lineHeight: 18,
  },
});
