import { StyleSheet } from "react-native";
import { Colors } from "@/constants/Colors";

export const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "center",
    padding: 20
  },
  modalContainer: {
    padding: 20,
    gap: 16,
    maxHeight: "80%"
  },
  title: {
    color: Colors.text,
    fontSize: 24,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 8
  },
  nameInput: {
    height: 45
  },
  storyInput: {
    minHeight: 80,
    maxHeight: 120
  },
  buttonContainer: {
    flexDirection: "row",
    gap: 12,
    marginTop: 12
  },
  saveButton: {
    flex: 1,
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    borderRadius: 12
  },
  cancelButton: {
    flex: 1,
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    borderRadius: 12
  }
});