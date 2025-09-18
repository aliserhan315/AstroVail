import fs from "node:fs";
import path from "node:path";
import Star from "../star/star.model.js";
import User from "../user/user.model.js";
import { renderCertificatePdf } from "./certificate.service.js";

function toDataUrlIfExists(absPath) {
  try {
    const buf = fs.readFileSync(absPath);
    return `data:image/png;base64,${buf.toString("base64")}`;
  } catch {
    return undefined;
  }
}

function sendPdf(res, pdf, { filename = "certificate-of-ownership.pdf", download = false, rangeHeader = "" } = {}) {
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
          "Content-Range": `bytes ${start}-${end}/${total}` 
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
    const { starId, style = "ownership", recipientEmail = "", message = "", download } = req.query;
    
    if (!starId) {
      return res.status(400).json({ 
        error: "Missing required parameter: starId" 
      });
    }

    const validStyles = ["ownership", "classic", "modern", "cosmic"];
    const normalizedStyle = style.toLowerCase();
    if (!validStyles.includes(normalizedStyle)) {
      return res.status(400).json({ 
        error: "Invalid style. Must be one of: " + validStyles.join(", ") 
      });
    }

    const star = await Star.findById(starId).lean();
    if (!star) {
      return res.status(404).json({ 
        error: "Star not found" 
      });
    }
    let ownerName = "";
    if (star.owner) {
      if (typeof star.owner === "object") {
        ownerName = star.owner.name || 
                   star.owner.displayName || 
                   [star.owner.firstName, star.owner.lastName].filter(Boolean).join(" ") ||
                   "";
      } else {
        try {
          const user = await User.findById(star.owner).lean();
          if (user) {
            ownerName = user.name ||
                       user.displayName ||
                       [user.firstName, user.lastName].filter(Boolean).join(" ") ||
                       "";
          }
        } catch (userError) {
          console.warn("Failed to fetch user for owner:", userError.message);
        }
      }
    }

    const assetsRoot = path.resolve(process.cwd(), "assets/images");
    const logoPath = path.join(assetsRoot, "AstroVailLogo.png");
    const logoDataUrl = toDataUrlIfExists(logoPath);
    
    if (!logoDataUrl) {
      console.warn("Logo not found at:", logoPath);
    }

    const pdf = await renderCertificatePdf({
      star,
      style: normalizedStyle,
      recipientEmail: recipientEmail.trim(),
      message: message.trim(),
      ownerName: ownerName.trim(),
      logoDataUrl,
    });
    const sanitizedBaseName = star.baseName?.replace(/[^a-zA-Z0-9\-_]/g, '_') || 'star';
    const filename = `${sanitizedBaseName}_${normalizedStyle}_certificate.pdf`;

    sendPdf(res, pdf, {
      filename,
      download: Boolean(download),
      rangeHeader: req.headers.range || "",
    });

  } catch (error) {
    console.error("Certificate generation error:", {
      message: error.message,
      stack: error.stack,
      starId: req.query.starId,
      style: req.query.style
    });

    if (error.name === 'CastError' && error.path === '_id') {
      return res.status(400).json({ 
        error: "Invalid star ID format" 
      });
    }

    res.status(500).json({ 
      error: "Failed to generate certificate PDF",
      message: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

export async function generateCertificates(req, res) {
  try {
    const { certificates } = req.body;
    
    if (!Array.isArray(certificates) || certificates.length === 0) {
      return res.status(400).json({ 
        error: "certificates array is required" 
      });
    }

    const results = [];
    const errors = [];

    for (let i = 0; i < certificates.length; i++) {
      const cert = certificates[i];
      
      try {
        const { starId, style = "ownership", recipientEmail = "", message = "", ownerName = "" } = cert;
        
        if (!starId) {
          errors.push({ index: i, error: "Missing starId" });
          continue;
        }

        const star = await Star.findById(starId).lean();
        if (!star) {
          errors.push({ index: i, error: "Star not found" });
          continue;
        }

        let resolvedOwnerName = ownerName;
        if (!resolvedOwnerName && star.owner) {
          if (typeof star.owner === "object") {
            resolvedOwnerName = star.owner.name || star.owner.displayName || "";
          } else {
            try {
              const user = await User.findById(star.owner).lean();
              resolvedOwnerName = user?.name || user?.displayName || "";
            } catch {}
          }
        }

        const assetsRoot = path.resolve(process.cwd(), "assets/images");
        const logoDataUrl = toDataUrlIfExists(path.join(assetsRoot, "AstroVailLogo.png"));

        const pdf = await renderCertificatePdf({
          star,
          style: style.toLowerCase(),
          recipientEmail: recipientEmail.trim(),
          message: message.trim(),
          ownerName: resolvedOwnerName.trim(),
          logoDataUrl,
        });

        results.push({
          index: i,
          starId,
          pdfBase64: pdf.toString('base64'),
          filename: `${star.baseName?.replace(/[^a-zA-Z0-9\-_]/g, '_') || 'star'}_certificate.pdf`
        });

      } catch (error) {
        console.error(`Certificate generation error for index ${i}:`, error);
        errors.push({ 
          index: i, 
          error: error.message 
        });
      }
    }

    res.json({
      success: true,
      generated: results.length,
      total: certificates.length,
      results,
      errors
    });

  } catch (error) {
    console.error("Batch certificate generation error:", error);
    res.status(500).json({ 
      error: "Failed to generate certificates",
      message: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}