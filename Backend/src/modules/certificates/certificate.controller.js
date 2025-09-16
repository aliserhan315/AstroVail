import Star from "../star/star.model.js";
import { renderCertificatePdf } from "./certificate.service.js";


function sendPdf(res, pdf, { filename = "certificate-preview.pdf", download = false, rangeHeader = "" } = {}) {
const total = pdf.length;
res.set({
"Content-Type": "application/pdf",
"Cache-Control": "no-store",
"X-Content-Type-Options": "nosniff",
"Accept-Ranges": "bytes",
"Content-Disposition": `${download ? "attachment" : "inline"}; filename="${filename}"`,
});


if (rangeHeader) {
const m = /bytes=(\d+)-(\d*)/.exec(rangeHeader);
if (m) {
const start = Number(m[1]);
const end = m[2] ? Math.min(Number(m[2]), total - 1) : total - 1;
if (start <= end && end < total) {
const chunk = pdf.subarray(start, end + 1);
res.status(206).set({
"Content-Length": String(chunk.length),
"Content-Range": `bytes ${start}-${end}/${total}`,
});
res.end(chunk);
return;
}
}
}


res.set("Content-Length", String(total));
res.end(pdf);
}


export async function previewPdf(req, res) {
try {
const { starId, style = "classic", recipientEmail = "", message = "", download } = req.query;
if (!starId) return res.status(400).send("Missing starId");


const star = await Star.findById(starId).lean();
if (!star) return res.status(404).send("Star not found");


const pdf = await renderCertificatePdf({ star, style, recipientEmail, message });
sendPdf(res, pdf, { filename: "certificate-preview.pdf", download: Boolean(download), rangeHeader: req.headers.range || "" });
} catch (e) {
console.error("preview.pdf error:", e?.stack || e?.message || e);
res.status(500).send("Failed to render preview");
}
}

