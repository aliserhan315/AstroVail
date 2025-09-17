import api from "@/lib/api";

export type CertificateStyle = "classic" | "modern" | "cosmic";

export function buildCertificateUrl(params: {
  starId: string;
  style?: CertificateStyle;
  recipientEmail?: string;
  message?: string;
  download?: boolean;
}) {
  const base = api.defaults.baseURL?.replace(/\/$/, "") || "";
  const u = new URL("/certificates/preview.pdf", base || window.location.origin);
  u.searchParams.set("starId", params.starId);
  if (params.style) u.searchParams.set("style", params.style);
  if (params.recipientEmail) u.searchParams.set("recipientEmail", params.recipientEmail);
  if (params.message) u.searchParams.set("message", params.message);
  if (params.download) u.searchParams.set("download", "1");
  return u.toString();
}

export async function downloadCertificate(params: Parameters<typeof buildCertificateUrl>[0]) {
  const url = buildCertificateUrl({ ...params, download: true });
  const headers = (api.defaults.headers?.common as any) || {};
  const res = await fetch(url, { headers });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const blob = await res.blob();
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "certificate.pdf";
  a.click();
  URL.revokeObjectURL(a.href);
}

export const CertificatesAPI = {
  open(params: Parameters<typeof buildCertificateUrl>[0]) {
    const url = buildCertificateUrl(params);
    window.open(url, "_blank");
  },
  download: downloadCertificate,
};
