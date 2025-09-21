import { Platform, StyleSheet } from "react-native";

export const overlayStyles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "black" },
  cameraContainer: { flex: 1 },
  hudContainer: {
    position: "absolute",
    top: 60,
    left: 20,
    right: 20,
    backgroundColor: "rgba(0,0,0,0.85)",
    padding: 16,
    borderRadius: 12,
    borderColor: "rgba(255,255,255,0.2)",
    borderWidth: 1,
  },
  starName: { color: "#00ff88", fontSize: 18, fontWeight: "bold", textAlign: "center", marginBottom: 8 },
  guidanceText: { color: "white", fontSize: 16, textAlign: "center", marginBottom: 12, lineHeight: 22 },
  debugInfo: { borderTopWidth: 1, borderTopColor: "rgba(255,255,255,0.3)", paddingTop: 8, marginTop: 8 },
  debugText: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 11,
    fontFamily: Platform.select({ ios: "Menlo", android: "monospace" }),
    marginBottom: 2,
  },
});