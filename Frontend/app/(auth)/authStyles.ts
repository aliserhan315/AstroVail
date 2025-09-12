import { StyleSheet, Platform } from "react-native";

export const COLORS = {
  primary: "#2563EB",
  text: "#FFFFFF",
  textDim: "rgba(255,255,255,0.75)",
  underline: "rgba(255,255,255,0.65)",
  overlayTop: "rgba(5,10,25,0.35)",
  overlayBottom: "rgba(5,8,20,0.85)",
};

export default StyleSheet.create({
  root: { flex: 1, backgroundColor: "#000" },

  bg: { ...StyleSheet.absoluteFillObject },
  overlay: { ...StyleSheet.absoluteFillObject },

  centerWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
    row: {
    flexDirection: "row",
    gap: 12,
    width: "100%",
  },

  logo: { width: 56, height: 56, marginBottom: 14, resizeMode: "contain" },
  title: {
    color: COLORS.text,
    fontSize: 26,
    lineHeight: 30,
    textAlign: "center",
    fontWeight: "800",
  },
  subRow: { marginTop: 6, flexDirection: "row", gap: 6, alignItems: "center" },
  hint: { color: COLORS.textDim, textAlign: "center" },
  link: { color: COLORS.text, fontWeight: "800", textDecorationLine: "underline" },

  form: { width: "100%", marginTop: 20 },
  inputWrap: { marginTop: 16 },
  inputLabel: { color: COLORS.textDim, marginBottom: 6, fontSize: 13 },
  input: {
    color: COLORS.text,
    fontSize: 16,
    paddingVertical: Platform.OS === "ios" ? 10 : 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.underline,
  },

  smallLink: { marginTop: 10, alignSelf: "flex-start" },
  smallLinkText: { color: COLORS.text, textDecorationLine: "underline", opacity: 0.9 },

  primaryBtn: {
    marginTop: 22,
    width: "100%",
    height: 54,
    borderRadius: 16,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: COLORS.primary,
    shadowOpacity: 0.35,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  primaryText: { color: "#fff", fontSize: 17, fontWeight: "800" },

  googleBtn: {
    marginTop: 12,
    width: "100%",
    height: 52,
    borderRadius: 12,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  googleText: { color: "#111827", fontWeight: "700" },
});
