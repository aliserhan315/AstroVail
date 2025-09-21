import React from "react";
import { CertificatesAPI,CertificateStyle } from "@/lib/certificateapi";

export function CertificateActions({
  starId,
  style = "classic",
  recipientEmail = "",
  message = "",
}: {
  starId: string;
  style?: CertificateStyle;
  recipientEmail?: string;
  message?: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        className="px-3 py-2 rounded-md shadow text-sm border"
        onClick={() => CertificatesAPI.open({ starId, style, recipientEmail, message })}
      >
        Preview PDF
      </button>
      <button
        type="button"
        className="px-3 py-2 rounded-md shadow text-sm border"
        onClick={() => CertificatesAPI.download({ starId, style, recipientEmail, message })}
      >
        Download PDF
      </button>
    </div>
  );
}