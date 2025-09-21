import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: "50%",
    left: "50%",
    marginTop: -20,
    marginLeft: -20,
    width: 40,
    height: 40,
  },
  horizontal: {
    position: "absolute",
    top: 19,
    left: 5,
    width: 30,
    height: 2,
    backgroundColor: "rgba(255,255,255,0.8)",
  },
  vertical: {
    position: "absolute",
    top: 5,
    left: 19,
    width: 2,
    height: 30,
    backgroundColor: "rgba(255,255,255,0.8)",
  },
  centerDot: {
    position: "absolute",
    top: 17,
    left: 17,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "rgba(255,255,255,0.9)",
  },
});
