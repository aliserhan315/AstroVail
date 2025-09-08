import { Colors } from "@/constants/Colors";

export const cardBase = {
  backgroundColor: "rgba(21, 58, 160, 0.28)",
  borderRadius: 16,
  paddingVertical: 12,
  paddingHorizontal: 12,
  borderWidth: 1,
  borderColor: "rgba(255,255,255,0.06)",
  marginHorizontal: 16,
  marginVertical: 8,
} as const;

export const titleText = {
  color: Colors.text,
  fontSize: 16,
  fontWeight: "600",
} as const;

export const dateText = {
  color: Colors.text,
  opacity: 0.9,
  fontSize: 14,
} as const;

export const bodyText = {
  color: Colors.text,
  opacity: 0.8,
  fontSize: 13,
  lineHeight: 18,
} as const;

export const successPill = {
  paddingHorizontal: 10,
  paddingVertical: 6,
  borderRadius: 999,
  backgroundColor: "rgba(88,214,141,0.18)",
  borderWidth: 1,
  borderColor: "rgba(88,214,141,0.35)",
} as const;

export const successPillText = {
  color: "#58d68d",
  fontSize: 11,
  fontWeight: "600",
} as const;

export const subtlePill = {
  paddingHorizontal: 10,
  paddingVertical: 6,
  borderRadius: 999,
  backgroundColor: "rgba(255,255,255,0.08)",
  borderWidth: 1,
  borderColor: "rgba(255,255,255,0.14)",
} as const;

export const subtleText = {
  color: Colors.text,
  fontSize: 11,
  fontWeight: "500",
  opacity: 0.95,
} as const;
