import React from "react";
import { Pressable, Text } from "react-native";
import * as WebBrowser from "expo-web-browser";

type Props = {
  baseUrl: string;
  starId: string;
  styleWire: "classic" | "modern" | "cosmic";
  recipientEmail?: string;
  message?: string;
};

export default function CertificatePreviewButton(props: Props) {
  const u =
    `${props.baseUrl}/certificates/preview.pdf?starId=${encodeURIComponent(props.starId)}` +
    `&style=${encodeURIComponent(props.styleWire)}` +
    `&recipientEmail=${encodeURIComponent(props.recipientEmail || "")}` +
    `&message=${encodeURIComponent(props.message || "")}`;
  return (
    <Pressable onPress={() => WebBrowser.openBrowserAsync(u)} style={{ marginTop: 8, alignSelf: "flex-start" }}>
      <Text style={{ color: "#9ddcff" }}>Preview certificate</Text>
    </Pressable>
  );
}
