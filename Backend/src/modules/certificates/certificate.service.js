import { jsPDF } from "jspdf";

const T = (v) => (v ?? "-").toString();

function addImageSafe(doc, dataUrl, x, y, w, h) {
  if (!dataUrl) return;
  try { doc.addImage(dataUrl, "JPEG", x, y, w, h, undefined, "FAST"); } catch {}
}

function drawOwnership(doc, { star, recipientEmail, message, ownerName, logoDataUrl }) {
  const pw = doc.internal.pageSize.getWidth();
  const ph = doc.internal.pageSize.getHeight();
  doc.setFillColor(252, 248, 243);
  doc.rect(0, 0, pw, ph, "F");
  doc.setDrawColor(184, 134, 11);
  doc.setLineWidth(3);
  doc.rect(30, 30, pw - 60, ph - 60);
  doc.setDrawColor(229, 183, 59);
  doc.setLineWidth(1);
  doc.rect(42, 42, pw - 84, ph - 84);

  let y = 70;
  if (logoDataUrl) {
    addImageSafe(doc, logoDataUrl, (pw - 180) / 2, y, 180, 50);
    y += 65;
  }

  doc.setTextColor(120, 53, 15);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(28);
  doc.text("Certificate of Star Ownership", pw / 2, y, { align: "center" });
  y += 20;
  doc.setFont("helvetica", "normal");
  doc.setTextColor(92, 92, 92);
  doc.setFontSize(11);
  doc.text("This official certificate confirms the dedicated registration", pw / 2, y, { align: "center" });
  y += 12;
  doc.text("and symbolic ownership of the celestial body detailed below.", pw / 2, y, { align: "center" });
  y += 30;
  doc.setTextColor(120, 53, 15);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text("Proudly Presented To", pw / 2, y, { align: "center" });
  y += 20;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.setTextColor(25, 25, 25);
  const ownerText = ownerName ? T(ownerName) : "Certificate Holder";
  doc.text(ownerText, pw / 2, y, { align: "center" });
  y += 15;
  doc.setDrawColor(184, 134, 11);
  doc.setLineWidth(1);
  doc.line(100, y, pw - 100, y);

  y += 25;
  const leftCol = 70;
  const rightCol = pw / 2 + 30;
  const colWidth = (pw - 140) / 2;

  const sectionTitle = (txt, x, yy) => {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(120, 53, 15);
    doc.text(txt, x, yy);
    return yy + 15;
  };

  const fieldLabel = (txt, x, yy) => {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(70, 70, 70);
    doc.text(txt, x, yy);
    return yy + 12;
  };

  const fieldValue = (txt, x, yy) => {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(25, 25, 25);
    const lines = doc.splitTextToSize(T(txt), colWidth - 15);
    doc.text(lines, x, yy);
    return yy + (lines.length * 12) + 6;
  };

  let ly = sectionTitle("Star Details", leftCol, y);
  ly = fieldLabel("Base Name:", leftCol, ly);
  ly = fieldValue(star.baseName, leftCol, ly);
  ly = fieldLabel("Display Name:", leftCol, ly);
  ly = fieldValue(star.displayName ?? "Not specified", leftCol, ly);
  ly = fieldLabel("Constellation:", leftCol, ly);
  ly = fieldValue(star.constellation ?? "Uncharted Region", leftCol, ly);
  let ry = sectionTitle("Celestial Coordinates", rightCol, y);
  ry = fieldLabel("Right Ascension:", rightCol, ry);
  ry = fieldValue(star.ra ?? "Not specified", rightCol, ry);
  ry = fieldLabel("Declination:", rightCol, ry);
  ry = fieldValue(star.dec ?? "Not specified", rightCol, ry);
  ry = fieldLabel("Magnitude:", rightCol, ry);
  ry = fieldValue(star.magnitude ?? "Not specified", rightCol, ry);
  ry = fieldLabel("Recipient Email:", rightCol, ry);
  ry = fieldValue(recipientEmail || "Not specified", rightCol, ry);

  const msgTop = Math.max(ly, ry) + 10;
  if (message && message.trim() && msgTop < ph - 120) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(120, 53, 15);
    doc.text("Personal Message", leftCol, msgTop);
    
    doc.setFont("helvetica", "italic");
    doc.setFontSize(10);
    doc.setTextColor(40, 40, 40);
    const msgLines = doc.splitTextToSize(String(message).slice(0, 200), pw - 140);
    const availableHeight = ph - msgTop - 80;
    const maxLines = Math.floor(availableHeight / 12);
    const displayLines = msgLines.slice(0, maxLines);
    doc.text(displayLines, leftCol, msgTop + 15);
  }

  doc.setDrawColor(120, 120, 120);
  doc.setLineWidth(1);
  doc.line(leftCol, ph - 80, leftCol + 150, ph - 80);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(80, 80, 80);
  doc.text("Authorized Registry Signature", leftCol, ph - 68);
  doc.setFontSize(8);
  doc.setTextColor(120, 120, 120);
  doc.text(`Registry ID: ${T(star._id || star.starId || "STAR-" + Date.now())}`, pw - 70, ph - 50, { align: "right" });
  doc.text(`Date: ${new Date().toLocaleDateString()}`, pw - 70, ph - 38, { align: "right" });
}

function drawClassic(doc, { star, style, recipientEmail, message, ownerName, logoDataUrl }) {
  const pw = doc.internal.pageSize.getWidth();
  const ph = doc.internal.pageSize.getHeight();
  const margin = 40;

  doc.setFillColor(255, 255, 255);
  doc.rect(0, 0, pw, ph, "F");
  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(1);
  doc.rect(margin, margin, pw - margin * 2, ph - margin * 2);

  let y = margin + 25;

  if (logoDataUrl) {
    const lw = 160, lh = 45;
    addImageSafe(doc, logoDataUrl, (pw - lw) / 2, y, lw, lh);
    y += lh + 25;
  }
  doc.setTextColor(30, 30, 30);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(24);
  doc.text("Certificate of Stellar Dedication", pw / 2, y, { align: "center" });
  
  y += 18;
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100, 100, 100);
  doc.setFontSize(10);
  doc.text(`${T(style).toUpperCase()} EDITION`, pw / 2, y, { align: "center" });

  y += 20;
  if (ownerName) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(50, 50, 50);
    doc.text(`Dedicated to: ${T(ownerName)}`, pw / 2, y, { align: "center" });
    y += 15;
  }

  const cardX = margin + 15;
  const cardY = y;
  const cardW = pw - (margin + 15) * 2;
  const cardH = ph - cardY - margin - 15;
  const cardPad = 20;
  
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(180, 180, 180);
  doc.roundedRect(cardX, cardY, cardW, cardH, 6, 6, "FD");

  let cy = cardY + cardPad;
  const cx = cardX + cardPad;
  const cw = cardW - cardPad * 2;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(40, 40, 40);
  doc.text("Star Registry Information", cx, cy);
  cy += 20;

  const row = (label, value, isHeader = false) => {
    if (isHeader) {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(60, 60, 60);
      doc.text(label, cx, cy);
      cy += 15;
      return;
    }

    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(80, 80, 80);
    const labelText = `${label}`;
    const labelW = doc.getTextWidth(labelText + "  ");
    doc.text(labelText, cx, cy);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(30, 30, 30);
    const v = T(value) || "Not specified";
    const lines = doc.splitTextToSize(v, cw - labelW);
    doc.text(lines, cx + labelW, cy);

    cy += 12 + Math.max(0, lines.length - 1) * 10;
  };

  row("Basic Information", "", true);
  row("Base Name:", star.baseName);
  row("Display Name:", star.displayName ?? "Not specified");
  row("Constellation:", star.constellation ?? "Uncharted");

  cy += 6;
  row("Technical Details", "", true);
  row("Right Ascension:", star.ra ?? "Not specified");
  row("Declination:", star.dec ?? "Not specified");
  row("Magnitude:", star.magnitude ?? "Not specified");

  cy += 6;
  row("Ownership Details", "", true);
  row("Owner:", ownerName || "Certificate Holder");
  row("Recipient Email:", recipientEmail || "Not specified");

  if (message && message.trim() && cy < cardY + cardH - 60) {
    cy += 10;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(80, 80, 80);
    doc.text("Personal Message:", cx, cy);
    cy += 12;
    
    doc.setFont("helvetica", "italic");
    doc.setFontSize(9);
    doc.setTextColor(60, 60, 60);
    const availableHeight = cardY + cardH - cy - 30;
    const maxLines = Math.floor(availableHeight / 10);
    const safeMsg = String(message).slice(0, 300);
    const msgLines = doc.splitTextToSize(safeMsg, cw);
    const displayLines = msgLines.slice(0, maxLines);
    doc.text(displayLines, cx, cy);
  }

  doc.setFontSize(7);
  doc.setTextColor(120, 120, 120);
  doc.text(`Registry ID: ${T(star._id || star.starId || "STAR-" + Date.now())} | Generated: ${new Date().toLocaleDateString()}`, pw - margin, ph - 12, { align: "right" });
}

function drawModern(doc, opts) {
  const { star, style, recipientEmail, message, ownerName, logoDataUrl } = opts;
  const pw = doc.internal.pageSize.getWidth();
  const ph = doc.internal.pageSize.getHeight();
  const margin = 35;

  doc.setFillColor(41, 98, 255);
  doc.rect(0, 0, pw, 90, "F");
  doc.setFillColor(59, 130, 246);
  doc.rect(0, 0, pw, 45, "F");

  if (logoDataUrl) {
    addImageSafe(doc, logoDataUrl, (pw - 140) / 2, 12, 140, 40);
  }

  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.text("STELLAR DEDICATION CERTIFICATE", pw / 2, 70, { align: "center" });
  doc.setFillColor(250, 250, 250);
  doc.rect(0, 90, pw, ph - 90, "F");
  doc.setFillColor(16, 185, 129);
  doc.roundedRect(margin, 105, 80, 20, 10, 10, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.text(T(style).toUpperCase(), margin + 40, 117, { align: "center" });

  let y = 140;
  if (ownerName) {
    doc.setTextColor(30, 30, 30);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.text(`Presented to: ${T(ownerName)}`, pw / 2, y, { align: "center" });
    y += 20;
  }

  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(1);
  doc.line(margin, y, pw - margin, y);
  y += 20;
  const colWidth = (pw - margin * 3) / 2;
  const leftX = margin;
  const rightX = margin * 2 + colWidth;

  const sectionHeader = (title, x, yy) => {
    doc.setFillColor(99, 102, 241);
    doc.roundedRect(x, yy - 10, colWidth, 16, 3, 3, "F");
    doc.setFont("helvetica", "bold");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(9);
    doc.text(title, x + 6, yy);
    return yy + 20;
  };

  const infoField = (label, value, x, yy) => {
    doc.setFont("helvetica", "bold");
    doc.setTextColor(70, 70, 70);
    doc.setFontSize(8);
    doc.text(label, x, yy);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(20, 20, 20);
    doc.setFontSize(9);
    const lines = doc.splitTextToSize(T(value) || "Not specified", colWidth - 8);
    doc.text(lines, x, yy + 10);
    
    return yy + 10 + (lines.length * 9) + 6;
  };

  let ly = sectionHeader("Star Identification", leftX, y);
  ly = infoField("Base Name:", star.baseName, leftX, ly);
  ly = infoField("Display Name:", star.displayName ?? "Not specified", leftX, ly);
  ly = infoField("Constellation:", star.constellation ?? "Uncharted", leftX, ly);
  let ry = sectionHeader("Celestial Data", rightX, y);
  ry = infoField("Right Ascension:", star.ra, rightX, ry);
  ry = infoField("Declination:", star.dec, rightX, ry);
  ry = infoField("Magnitude:", star.magnitude, rightX, ry);
  ry = infoField("Recipient:", recipientEmail || "Not specified", rightX, ry);

  const msgY = Math.max(ly, ry) + 10;
  if (message && message.trim() && msgY < ph - 80) {
    let my = sectionHeader("Personal Message", leftX, msgY);
    doc.setFont("helvetica", "italic");
    doc.setFontSize(9);
    doc.setTextColor(50, 50, 50);
    const availableHeight = ph - my - 60;
    const maxLines = Math.floor(availableHeight / 9);
    const msgLines = doc.splitTextToSize(String(message).slice(0, 400), pw - margin * 2);
    const displayLines = msgLines.slice(0, maxLines);
    doc.text(displayLines, leftX, my);
  }

  doc.setFillColor(75, 85, 99);
  doc.rect(0, ph - 30, pw, 30, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.text(`Registry ID: ${T(star._id || star.starId || "STAR-" + Date.now())}`, margin, ph - 15);
  doc.text(`Generated: ${new Date().toLocaleDateString()}`, pw - margin, ph - 15, { align: "right" });
}

function drawCosmic(doc, opts) {
  const { star, style, recipientEmail, message, ownerName, logoDataUrl } = opts;
  const pw = doc.internal.pageSize.getWidth();
  const ph = doc.internal.pageSize.getHeight();

  doc.setFillColor(15, 23, 42);
  doc.rect(0, 0, pw, ph, "F");
  doc.setFillColor(79, 70, 229);
  doc.rect(0, 0, pw, 100, "F");
  doc.setFillColor(99, 102, 241);
  doc.rect(0, 0, pw, 60, "F");

  if (logoDataUrl) {
    addImageSafe(doc, logoDataUrl, (pw - 160) / 2, 15, 160, 45);
  }

  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.text("COSMIC STAR CERTIFICATE", pw / 2, 85, { align: "center" });

  const margin = 25;
  const cardX = margin;
  const cardY = 120;
  const cardW = pw - margin * 2;
  const cardH = ph - cardY - margin;

  doc.setFillColor(30, 41, 59);
  doc.roundedRect(cardX, cardY, cardW, cardH, 12, 12, "F");
  doc.setDrawColor(147, 197, 253);
  doc.setLineWidth(1.5);
  doc.roundedRect(cardX, cardY, cardW, cardH, 12, 12);

  let y = cardY + 25;
  const x = cardX + 20;
  const contentWidth = cardW - 40;

  if (ownerName) {
    doc.setFont("helvetica", "bold");
    doc.setTextColor(147, 197, 253);
    doc.setFontSize(12);
    doc.text("COSMIC DEDICATION", x, y);
    y += 16;
    
    doc.setFont("helvetica", "bold");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.text(T(ownerName), pw / 2, y, { align: "center" });
    y += 20;
  }

  const cosmicField = (label, value) => {
    if (y > cardY + cardH - 60) return;
    
    doc.setFont("helvetica", "bold");
    doc.setTextColor(167, 243, 208);
    doc.setFontSize(10);
    doc.text(label, x, y);
    y += 12;
    
    doc.setFont("helvetica", "normal");
    doc.setTextColor(241, 245, 249);
    doc.setFontSize(10);
    const lines = doc.splitTextToSize(T(value) || "Unknown", contentWidth - 15);
    const availableLines = Math.floor((cardY + cardH - y - 50) / 10);
    const displayLines = lines.slice(0, Math.max(1, availableLines));
    doc.text(displayLines, x + 8, y);
    y += (displayLines.length * 10) + 8;
  };

  cosmicField("STELLAR DESIGNATION", star.baseName);
  cosmicField("DISPLAY NAME", star.displayName ?? "Unnamed Star");
  cosmicField("CONSTELLATION", star.constellation ?? "Deep Space Region");
  cosmicField("COORDINATES", `RA: ${T(star.ra)} | Dec: ${T(star.dec)}`);
  cosmicField("MAGNITUDE", star.magnitude ?? "Variable");
  cosmicField("RECIPIENT", recipientEmail || "Space Explorer");

  if (message && message.trim() && y < cardY + cardH - 50) {
    doc.setFont("helvetica", "bold");
    doc.setTextColor(192, 132, 252);
    doc.setFontSize(10);
    doc.text("COSMIC MESSAGE", x, y);
    y += 12;
    doc.setFont("helvetica", "italic");
    doc.setTextColor(203, 213, 225);
    doc.setFontSize(9);
    const availableHeight = cardY + cardH - y - 30;
    const maxLines = Math.floor(availableHeight / 9);
    const msgLines = doc.splitTextToSize(String(message).slice(0, 250), contentWidth - 15);
    const displayLines = msgLines.slice(0, maxLines);
    doc.text(displayLines, x + 8, y);
  }

  doc.setFillColor(15, 23, 42);
  doc.rect(0, ph - 25, pw, 25, "F");
  doc.setTextColor(148, 163, 184);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.text(`Registry ID: ${T(star._id || star.starId || "COSMIC-" + Date.now())}`, margin, ph - 12);
  doc.text(`Charted: ${new Date().toLocaleDateString()}`, pw - margin, ph - 12, { align: "right" });
}

export async function renderCertificatePdf({
  star, style = "ownership", recipientEmail = "", message = "", ownerName = "", logoDataUrl
}) {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const s = String(style || "ownership").toLowerCase().trim();

  const common = { star, recipientEmail, message, ownerName, logoDataUrl };

  switch(s) {
    case "ownership":
      drawOwnership(doc, common);
      break;
    case "modern":
      drawModern(doc, { ...common, style: s });
      break;
    case "cosmic":
      drawCosmic(doc, { ...common, style: s });
      break;
    case "classic":
    default:
      drawClassic(doc, { ...common, style: s });
      break;
  }

  const ab = doc.output("arraybuffer");
  return Buffer.from(ab);
}