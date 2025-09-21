import api from "@/lib/api";
import * as WebBrowser from "expo-web-browser";

export async function openCertificate({
  starId,
  style = "classic",    
  recipientEmail = "",
  message = "",
}: {
  starId: string;
  style?: "classic" | "modern" | "cosmic";
  recipientEmail?: string;
  message?: string;
}) {
  const base = (api.defaults.baseURL || "").replace(/\/$/, "") || "";
  const url =
    `${base}/certificates/preview.pdf` +
    `?starId=${encodeURIComponent(starId)}` +
    `&style=${encodeURIComponent(style)}` +
    `&recipientEmail=${encodeURIComponent(recipientEmail)}` +
    `&message=${encodeURIComponent(message)}`;
  await WebBrowser.openBrowserAsync(url);
}