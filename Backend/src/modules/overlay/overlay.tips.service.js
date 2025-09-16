import { GoogleGenerativeAI } from "@google/generative-ai";

const MODEL = process.env.GEMINI_MODEL || "gemini-1.5-flash";

export async function starGuidanceTips(input) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;

  const genai = new GoogleGenerativeAI(apiKey);
  const model = genai.getGenerativeModel({ model: MODEL });

  const { inFrame, angleDeg, distanceFOV, center, target } = input;

  const sys = `You generate short, practical camera move instructions for astrophotography.
Output JSON with keys: "short","steps". "short" ≤ 110 chars. "steps" = array of 2-5 bullet steps.
Avoid fluff. Use human compass words (up/down/left/right).`;

  const user = [
    `Frame center RA=${center.ra.toFixed(6)}, Dec=${center.dec.toFixed(6)}.`,
    `Target ${target.name || "star"} RA=${target.ra.toFixed(6)}, Dec=${target.dec.toFixed(6)}.`,
    typeof target.mag === "number" ? `Magnitude≈${target.mag.toFixed(1)}.` : "",
    inFrame
      ? `The target is inside the frame. Provide micro-adjustment guidance.`
      : `The target is outside the frame at approx angle=${Math.round(angleDeg ?? 0)}°, distance≈${(distanceFOV ?? 0).toFixed(1)} FOV radii. Provide move direction and how far.`,
  ].join(" ");

  const resp = await model.generateContent([
    { role: "user", parts: [{ text: `${sys}

User:
${user}` }] },
  ]);
  const text = resp.response.text().trim();

  try {
    const json = JSON.parse(text);
    return { short: String(json.short || "").slice(0, 200), steps: Array.isArray(json.steps) ? json.steps.slice(0, 6) : [], raw: text };
  } catch {
    return { short: text.slice(0, 200), steps: [], raw: text };
  }
}