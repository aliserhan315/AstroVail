import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    position: "absolute",
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  starDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: "#00ff88",
    borderColor: "white",
    borderWidth: 2,
    position: "absolute",
    zIndex: 2,
  },
  starPulse: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderColor: "#00ff88",
    borderWidth: 2,
    position: "absolute",
    opacity: 0.6,
  },
});