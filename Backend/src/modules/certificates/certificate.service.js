import puppeteer from "puppeteer";


function esc(v = "") {
    return String(v)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}


function buildHtml({ star, style, recipientEmail, message }) {
    return `<!doctype html>
    <html lang="en">
    <head>
    <meta charset="utf-8" />
    <meta http-equiv="x-ua-compatible" content="ie=edge" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Certificate Preview</title>
    <style>
    @page { size: A4; margin: 0; }
    html, body { margin: 0; padding: 0; }
    body { font-family: system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif; background: #fff; color: #111; }
    .page { width: 794px; height: 1123px; margin: 0 auto; padding: 48px; box-sizing: border-box; }
    .h1 { font-size: 28px; font-weight: 800; text-align: center; letter-spacing: .4px; }
    .sub { text-align:center; margin-top:6px; color:#666; font-size: 12px; }
    .card { margin-top: 24px; border: 1px solid #ddd; border-radius: 12px; padding: 24px; }
    .row { margin: 8px 0; font-size: 14px; }
    .label { color: #555; font-weight: 600; margin-right: 6px; }
    .badge { display:inline-block; border:1px solid #aaa; border-radius:999px; padding:4px 10px; font-size:12px; }
    .msg { margin-top: 16px; white-space: pre-wrap; line-height:1.45; }
    </style>
    </head>
    <body>
    <div class="page">
    <div class="h1">Certificate of Stellar Dedication</div>
    <div class="sub">${esc(style)} • Preview</div>
    <div class="card">
    <div class="row"><span class="label">Base Name:</span> ${esc(star.baseName ?? "-")}</div>
    <div class="row"><span class="label">Display Name:</span> ${esc(star.displayName ?? "-")}</div>
    <div class="row"><span class="label">Constellation:</span> ${esc(star.constellation ?? "-")}</div>
    <div class="row"><span class="label">RA:</span> ${esc(star.ra ?? "-")} &nbsp; <span class="label">Dec:</span> ${esc(star.dec ?? "-")}</div>
    <div class="row"><span class="label">Magnitude:</span> ${esc(star.magnitude ?? "-")}</div>
    <div class="row"><span class="label">Recipient:</span> ${esc(recipientEmail || "—")}</div>
    <div class="row"><span class="badge">Preview</span></div>
    ${message ? `<div class="msg">${esc(String(message).slice(0, 1000))}</div>` : ""}
    </div>
    </div>
    </body>
    </html>`;
}


export async function renderCertificatePdf({ star, style = "classic", recipientEmail = "", message = "" }) {
    const html = buildHtml({ star, style, recipientEmail, message });
    const browser = await puppeteer.launch({ headless: true, args: ["--no-sandbox"] });
    try {
        const page = await browser.newPage();
        await page.setContent(html, { waitUntil: ["domcontentloaded", "networkidle0"] });
        await page.emulateMediaType("screen");
        const pdf = await page.pdf({ format: "A4", printBackground: true, preferCSSPageSize: true });
        await page.close();

    if (!pdf || pdf.length < 1000 || !pdf.slice(0, 5).toString().startsWith("%PDF-")) {
        throw new Error("Invalid PDF generated");
    }
    return pdf;
    } finally {
        await browser.close();
    }
}