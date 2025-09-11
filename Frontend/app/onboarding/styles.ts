import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "black" },

  bgImage: { ...StyleSheet.absoluteFillObject },

  gradientOverlay: { ...StyleSheet.absoluteFillObject },

  titleWrap: {
    position: "absolute",
    top: "60%",
    width: "100%",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  slideTitle: {
    color: "#FFFFFF",
    fontSize: 26,
    fontWeight: "800",
    textAlign: "center",
    letterSpacing: 0.5,
  },

  contentWrap: {
    position: "absolute",
    top: "70%",
    left: 16,
    right: 16,
    alignItems: "center",
  },

  paragraph: {
    color: "#FFFFFF",
    textAlign: "center",
    fontSize: 16,
    lineHeight: 22,
    paddingHorizontal: 8,
  },

glass: {
  width: "90%",
  borderRadius: 35,
  paddingVertical: 28,
  paddingHorizontal: 22,
  marginBottom: 30,
  marginTop: -120,   
  alignItems: "center",
  justifyContent: "center",
  gap: 10,
  backgroundColor: "rgba(255,255,255,0.15)",
  overflow: "hidden",
},
  glassTitle: {
    color: "#FFFFFF",
    fontSize: 22,
    fontWeight: "800",
    textAlign: "center",
    marginBottom: 6,
  },
  glassText: {
    color: "#E5E7EB",
    textAlign: "center",
    fontSize: 15,
    lineHeight: 21,
    marginBottom: 14,
  },

  ctaWrap: {
    borderRadius: 16,
    overflow: "hidden",
    alignSelf: "center",
    width: "70%",
  },
  ctaGradient: {
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 16,
  },
  ctaText: { color: "#FFFFFF", fontWeight: "800", fontSize: 16 },

  dotsRow: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 52,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginHorizontal: 3,
    backgroundColor: "rgba(255,255,255,0.35)",
  },
  dotActive: { width: 14, borderRadius: 7, backgroundColor: "#FFFFFF" },

  nextFab: {
    position: "absolute",
    right: 12,
    bottom: 92,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.10)",
    alignItems: "center",
    justifyContent: "center",
  },
  nextIcon: { color: "#FFFFFF", fontSize: 22, fontWeight: "800" },

letsStartLink: {
  position: "absolute",
  bottom: 24,
  alignSelf: "center",
  paddingVertical: 10,
  paddingHorizontal: 24,
  borderRadius: 35,
  backgroundColor: "#2563EB",  
  shadowColor: "#2563EB",
  shadowOpacity: 0.3,
  shadowRadius: 6,
  shadowOffset: { width: 0, height: 3 },
  elevation: 4,

},
  letsStartText: { color: "#FFFFFF", fontWeight: "700" },

  skipBtn: {
    position: "absolute",
    right: 16,
    zIndex: 10,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  skipText: { color: "#E5E7EB", fontWeight: "600" },
});

export default styles;
