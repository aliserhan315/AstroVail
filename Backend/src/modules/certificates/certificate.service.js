
import { jsPDF } from "jspdf";

const T = (v) => (v ?? "-").toString();

function addImageSafe(doc, dataUrl, x, y, w, h) {
  if (!dataUrl) return;
  try { doc.addImage(dataUrl, "PNG", x, y, w, h, undefined, "FAST"); } catch {}
}

function drawOwnership(doc, { star, recipientEmail, message, ownerName, logoDataUrl }) {
  const pw = doc.internal.pageSize.getWidth();
  const ph = doc.internal.pageSize.getHeight();

  doc.setFillColor(253, 252, 248);
  doc.rect(0, 0, pw, ph, "F");
  doc.setDrawColor(80);
  doc.setLineWidth(1.2);
  doc.rect(36, 36, pw - 72, ph - 72);
  doc.setDrawColor(180);
  doc.setLineWidth(0.6);
  doc.rect(48, 48, pw - 96, ph - 96);

  if (logoDataUrl) addImageSafe(doc, logoDataUrl, (pw - 140) / 2, 64, 140, 36);

  
  let y = logoDataUrl ? 132 : 108;
  doc.setTextColor(30);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(28);
  doc.text("Certificate of Ownership", pw / 2, y, { align: "center" });

  y += 18;
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100);
  doc.setFontSize(11);
  doc.text("This certifies the registration and ownership of the star detailed below.", pw / 2, y, { align: "center" });

  y += 28;
  doc.setTextColor(30);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text("Issued to", pw / 2, y, { align: "center" });
  y += 18;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.text(ownerName ? T(ownerName) : "—", pw / 2, y, { align: "center" });

  y += 22;
  doc.setDrawColor(200);
  doc.line(84, y, pw - 84, y);
  y += 16;

  const left = 84, right = pw - 84, mid = (left + right) / 2, lh = 18;

  const label = (txt, x, yy) => { doc.setFont("helvetica", "bold"); doc.setFontSize(11); doc.setTextColor(80); doc.text(txt, x, yy); };
  const val   = (txt, x, yy) => { doc.setFont("helvetica", "normal"); doc.setFontSize(13); doc.setTextColor(20); doc.text(T(txt), x, yy); };

  let ly = y;
  label("Base Name", left, ly);      val(star.baseName, left, ly += 14 + 4); ly += lh;
  label("Display Name", left, ly);   val(star.displayName ?? "-", left, ly += 14 + 4); ly += lh;
  label("Constellation", left, ly);  val(star.constellation ?? "-", left, ly += 14 + 4); ly += lh;

  let ry = y;
  label("Coordinates", mid, ry);     val(`RA: ${T(star.ra)}   Dec: ${T(star.dec)}`, mid, ry += 14 + 4); ry += lh;
  label("Magnitude", mid, ry);       val(star.magnitude ?? "-", mid, ry += 14 + 4); ry += lh;
  label("Recipient", mid, ry);       val(recipientEmail || "—", mid, ry += 14 + 4); ry += lh;

  const mTop = Math.max(ly, ry) + 8;
  if (message) {
    doc.setFont("helvetica", "bold"); doc.setFontSize(11); doc.setTextColor(80);
    doc.text("Message", left, mTop);
    doc.setFont("helvetica", "normal"); doc.setFontSize(12); doc.setTextColor(20);
    const lines = doc.splitTextToSize(String(message).slice(0, 500), right - left);
    doc.text(lines, left, mTop + 16);
  }

  doc.setDrawColor(200);
  doc.line(left, ph - 120, left + 180, ph - 120);
  doc.setFont("helvetica", "normal"); doc.setFontSize(10); doc.setTextColor(60);
  doc.text("Authorized Signature", left, ph - 108);

  doc.setFontSize(9);
  doc.setTextColor(120);
  doc.text(`Registry ID: ${T(star._id || "-")}`, right, ph - 90, { align: "right" });
}

function drawClassic(doc, { star, style, recipientEmail, message, ownerName, logoDataUrl }) {
  const pw = doc.internal.pageSize.getWidth();
  const ph = doc.internal.pageSize.getHeight();
  const margin = 48;
  let y = margin + 6;

  if (logoDataUrl) {
    const lw = 120, lh = 32;
    addImageSafe(doc, logoDataUrl, (pw - lw) / 2, y - 2, lw, lh);
    y += lh + 6;
  }

  doc.setTextColor(17);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(28);
  doc.text("🌟 Certificate of Stellar Dedication", pw / 2, y, { align: "center" });

  y += 20;
  doc.setFont("helvetica", "normal");
  doc.setTextColor(102);
  doc.setFontSize(12);
  doc.text(`${T(style)} • Preview`, pw / 2, y, { align: "center" });
  doc.setTextColor(17);

  y += 18;
  if (ownerName) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.text(`Issued to: ${T(ownerName)}`, pw / 2, y, { align: "center" });
  }

  y += 16;
  const cardX = margin;
  const cardY = y;
  const cardW = pw - margin * 2;
  const cardPad = 18;
  doc.setDrawColor(221);
  doc.roundedRect(cardX, cardY, cardW, ph - cardY - margin, 12, 12);

  let cy = cardY + cardPad;
  const cx = cardX + cardPad;
  const cw = cardW - cardPad * 2;

  const row = (label, value) => {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    const labelText = `${label}`;
    const labelW = doc.getTextWidth(labelText + " ");
    doc.text(labelText, cx, cy);

    doc.setFont("helvetica", "normal");
    const v = T(value);
    const lines = doc.splitTextToSize(v, cw - labelW);
    doc.text(lines, cx + labelW, cy);

    cy += 18 + Math.max(0, lines.length - 1) * 14;
  };

  row("Base Name:", star.baseName);
  row("Display Name:", star.displayName ?? "-");
  row("Constellation:", star.constellation ?? "-");
  row("RA:", star.ra ?? "-");
  row("Dec:", star.dec ?? "-");
  row("Magnitude:", star.magnitude ?? "-");
  row("Owner:", ownerName || "—");
  row("Recipient:", recipientEmail || "—");

  const badge = "Preview";
  const bw = doc.getTextWidth(badge) + 16;
  doc.setDrawColor(170);
  doc.roundedRect(cx, cy - 12, bw, 18, 9, 9);
  doc.text(badge, cx + 8, cy + 2);
  cy += 28;

  if (message) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    const safeMsg = T(String(message).slice(0, 1000));
    const lines = doc.splitTextToSize(safeMsg, cw);
    doc.text(lines, cx, cy);
  }

  doc.setFontSize(9);
  doc.setTextColor(120);
  doc.text(`Registry ID: ${T(star._id || "-")}`, pw - margin, ph - 18, { align: "right" });
}

function drawModern(doc, opts) {
  const { star, style, recipientEmail, message, ownerName, logoDataUrl } = opts;
  const pw = doc.internal.pageSize.getWidth();
  const ph = doc.internal.pageSize.getHeight();
  const margin = 40;

  doc.setFillColor(25, 118, 210);
  doc.rect(0, 0, pw, 36, "F");

  if (logoDataUrl) addImageSafe(doc, logoDataUrl, margin, 6, 90, 24);

  doc.setTextColor(0);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(24);
  doc.text("🌟 Stellar Dedication", margin, 64);

  doc.setFont("helvetica", "normal");
  doc.setTextColor(120);
  doc.setFontSize(11);
  doc.text(`${T(style)} • Preview`, margin, 80);
  if (ownerName) {
    doc.setTextColor(40);
    doc.text(`Issued to: ${T(ownerName)}`, margin, 96);
  }

  let y = 110;
  doc.setDrawColor(230);
  doc.line(margin, y, pw - margin, y); y += 18;

  const label = (s) => { doc.setFont("helvetica", "bold"); doc.setTextColor(60); doc.setFontSize(11); doc.text(s, margin, y); y += 14; };
  const value = (v) => { doc.setFont("helvetica", "normal"); doc.setTextColor(10); doc.setFontSize(13); const lines = doc.splitTextToSize(T(v), pw - margin * 2); doc.text(lines, margin, y); y += lines.length * 16 + 4; };

  label("Base Name"); value(star.baseName);
  label("Display Name"); value(star.displayName ?? "-");
  label("Constellation"); value(star.constellation ?? "-");
  label("Coordinates"); value(`RA: ${T(star.ra)}   Dec: ${T(star.dec)}`);
  label("Magnitude"); value(star.magnitude ?? "-");
  label("Owner"); value(ownerName || "—");
  label("Recipient"); value(recipientEmail || "—");

  if (message) { label("Message"); value(String(message).slice(0, 1000)); }
}

function drawCosmic(doc, opts) {
  const { star, style, recipientEmail, message, ownerName, logoDataUrl } = opts;
  const pw = doc.internal.pageSize.getWidth();
  const ph = doc.internal.pageSize.getHeight();

  doc.setFillColor(12, 13, 28); doc.rect(0, 0, pw, ph, "F");
  doc.setFillColor(86, 70, 255); doc.rect(0, 0, pw, 60, "F");
  if (logoDataUrl) addImageSafe(doc, logoDataUrl, (pw - 120) / 2, 12, 120, 32);

  doc.setTextColor(255); doc.setFont("helvetica", "bold"); doc.setFontSize(26);
  doc.text("🌟 COSMIC CERTIFICATE", pw / 2, 44, { align: "center" });

  const margin = 36;
  const cardX = margin, cardY = 88, cardW = pw - margin * 2, cardH = ph - cardY - margin;
  doc.setDrawColor(140, 130, 255); doc.roundedRect(cardX, cardY, cardW, cardH, 12, 12);

  let y = cardY + 26; const x = cardX + 22; const w = cardW - 44;

  const row = (label, value) => {
    doc.setFont("helvetica", "bold"); doc.setTextColor(190, 190, 255); doc.setFontSize(11); doc.text(label, x, y);
    doc.setFont("helvetica", "normal"); doc.setTextColor(240); doc.setFontSize(13);
    const lines = doc.splitTextToSize(T(value), w); doc.text(lines, x, y + 14);
    y += 14 + lines.length * 16 + 4;
  };

  row("Issued to", ownerName || "—");
  row("Base Name", star.baseName);
  row("Display Name", star.displayName ?? "-");
  row("Constellation", star.constellation ?? "-");
  row("Coordinates", `RA: ${T(star.ra)}   Dec: ${T(star.dec)}`);
  row("Magnitude", star.magnitude ?? "-");
  row("Recipient", recipientEmail || "—");

  if (message) {
    doc.setFont("helvetica", "bold"); doc.setTextColor(190, 190, 255); doc.setFontSize(11); doc.text("Message", x, y);
    doc.setFont("helvetica", "normal"); doc.setTextColor(240); doc.setFontSize(12);
    const lines = doc.splitTextToSize(String(message).slice(0, 1000), w); doc.text(lines, x, y + 14);
  }
}

export async function renderCertificatePdf({
  star, style = "ownership", recipientEmail = "", message = "", ownerName = "", logoDataUrl
}) {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const s = String(style || "ownership").toLowerCase();

  const common = { star, recipientEmail, message, ownerName, logoDataUrl };

  if (s === "ownership") drawOwnership(doc, common);
  else if (s === "modern") drawModern(doc, { ...common, style: s });
  else if (s === "cosmic") drawCosmic(doc, { ...common, style: s });
  else drawClassic(doc, { ...common, style: s });

  const ab = doc.output("arraybuffer");
  return Buffer.from(ab);
}
