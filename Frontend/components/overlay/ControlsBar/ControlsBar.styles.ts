import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 50,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
    paddingHorizontal: 20,
  },
  button: {
    backgroundColor: "rgba(0,0,0,0.8)",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    borderColor: "rgba(255,255,255,0.3)",
    borderWidth: 1,
    minWidth: 50,
  },
  resetButton: {
    backgroundColor: "rgba(255,100,100,0.8)",
  },
  buttonText: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
    textAlign: "center",
  },
});
