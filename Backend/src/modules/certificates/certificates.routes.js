import { Router } from "express";
import puppeteer from "puppeteer";
import Star from "../star/star.model.js";

const r = Router();

r.get("/preview.pdf", async (req, res) => {
  try {
    const { starId, style = "classic", recipientEmail = "", message = "" } = req.query;
    const star = await Star.findById(starId).lean();
    if (!star) return res.status(404).send("Star not found");

    const html = `
      <html>
        <head><meta charset="utf-8" /><style>
          body { font-family: system-ui, -apple-system, Segoe UI, Roboto, sans-serif; margin: 0; background:#fff; }
          .page { width: 800px; height: 1131px; margin: 0 auto; padding: 48px; box-sizing: border-box; }
          .h1 { font-size: 28px; font-weight: 800; text-align: center; letter-spacing: 0.5px; }
          .sub { text-align:center; margin-top:4px; color:#666 }
          .card { margin-top: 24px; border: 1px solid #ddd; border-radius: 12px; padding: 24px; }
          .row { margin: 8px 0; font-size: 14px; }
          .label { color: #555; }
          .badge { display:inline-block; border:1px solid #aaa; border-radius:999px; padding:4px 10px; font-size:12px; }
          .msg { margin-top: 16px; white-space: pre-wrap; line-height:1.4; }
        </style></head>
        <body>
          <div class="page">
            <div class="h1">Certificate of Stellar Dedication</div>
            <div class="sub">${style} • Preview</div>
            <div class="card">
              <div class="row"><span class="label">Base Name:</span> ${star.baseName}</div>
              <div class="row"><span class="label">Display Name:</span> ${star.displayName ?? "-"}</div>
              <div class="row"><span class="label">Constellation:</span> ${star.constellation ?? "-"}</div>
              <div class="row"><span class="label">RA:</span> ${star.ra ?? "-"} &nbsp; <span class="label">Dec:</span> ${star.dec ?? "-"}</div>
              <div class="row"><span class="label">Magnitude:</span> ${star.magnitude ?? "-"}</div>
              <div class="row"><span class="label">Recipient:</span> ${recipientEmail || "—"}</div>
              <div class="row"><span class="badge">Preview</span></div>
              ${message ? `<div class="msg">${String(message).slice(0, 1000)}</div>` : ""}
            </div>
          </div>
        </body>
      </html>`;

    const browser = await puppeteer.launch({ args: ["--no-sandbox"] });
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "load" });
    const pdf = await page.pdf({ format: "A4", printBackground: true });
    await browser.close();

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "inline; filename=certificate-preview.pdf");
    return res.send(pdf);
  } catch (e) {
    console.error("preview.pdf error:", e?.message || e);
    return res.status(500).send("Failed to render preview");
  }
});

export default r;
