import { parseCertificateRequest, generateCertificateMessage } from "./ai.service.js";

export async function genCertificateMessage(req, res) {
  try {
    const input = parseCertificateRequest(req.body || {});
    const out = await generateCertificateMessage(input);
    if (!out?.model && out?.reason === "missing_api_key") {
      return res.status(503).json({ message: "AI not configured (GEMINI_API_KEY missing).", data: { text: "" } });
    }
    return res.json({ message: "ok", data: { text: out.text } });
  } catch (e) {
    const msg = e?.message || "ai-failed";
    return res.status(400).json({ message: msg, data: { text: "" } });
  }
}
