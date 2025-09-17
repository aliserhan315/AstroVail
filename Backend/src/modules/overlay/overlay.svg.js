export function circleSVG(x, y, r, label, w, h) {
  const labelEsc = String(label || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;");
  const svg = `
<svg width="100%" height="100%" viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg">
  <circle cx="${x}" cy="${y}" r="${r}" fill="none" stroke="rgba(255,255,255,0.95)" stroke-width="${Math.max(1.5, r * 0.15)}"/>
  ${label ? `<text x="${x + r + 8}" y="${y - r - 8}" font-size="28" fill="white" stroke="black" stroke-width="2">${labelEsc}</text>` : ""}
</svg>`;
  return Buffer.from(svg);
}

export function arrowSVG(x, y, angleDeg, len, w, h) {
  const dx = Math.cos((angleDeg * Math.PI) / 180) * len;
  const dy = Math.sin((angleDeg * Math.PI) / 180) * len;
  const x2 = x + dx, y2 = y + dy;
  const ah = 24;
  const svg = `
<svg width="100%" height="100%" viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <marker id="head" orient="auto" markerWidth="${ah}" markerHeight="${ah}" refX="${ah/2}" refY="${ah/2}">
      <path d="M0,0 L0,${ah} L${ah},${ah/2} z" fill="rgba(255,255,255,0.95)"/>
    </marker>
  </defs>
  <line x1="${x}" y1="${y}" x2="${x2}" y2="${y2}" stroke="rgba(255,255,255,0.95)" stroke-width="12" marker-end="url(#head)"/>
</svg>`;
  return Buffer.from(svg);
}

export function messageSVG(lines, w, h) {
  const pad = 24;
  const lineH = 32;
  const esc = (s) => String(s || "").replace(/&/g, "&amp;").replace(/</g, "&lt;");
  const clamped = Array.isArray(lines) ? lines.slice(0, 6) : [String(lines || "")];
  const height = Math.min(h * 0.3, pad * 2 + lineH * clamped.length + 10);
  const text = clamped
    .map((l, i) => `<text x="${pad * 2}" y="${pad + 26 + i * lineH}" font-size="24" fill="#fff" stroke="#000" stroke-width="1.2">${esc(l)}</text>`)
    .join("\n");
  const svg = `
<svg width="100%" height="100%" viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg">
  <rect x="${pad}" y="${pad}" width="${w - pad * 2}" height="${height}" rx="14" ry="14" fill="rgba(0,0,0,0.6)" stroke="rgba(255,255,255,0.85)" stroke-width="2"/>
  ${text}
  <text x="${w - pad * 2}" y="${pad + height - 12}" text-anchor="end" font-size="16" fill="#ddd">AstroVail</text>
</svg>`;
  return Buffer.from(svg);
}
