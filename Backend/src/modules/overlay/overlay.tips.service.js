import { GoogleGenerativeAI } from "@google/generative-ai";

const MODEL = process.env.GEMINI_MODEL || "gemini-1.5-flash";

export async function starGuidanceTips(input) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;

  const genai = new GoogleGenerativeAI(apiKey);
  const model = genai.getGenerativeModel({ model: MODEL });

  const { inFrame, angleDeg, distanceFOV, center, target } = input;

  const sys = `You are an attendent that check if the user send the picture of his star if that image was of his star you send back a responce saying your star is in your screen or no its is not then telll him if its in .`;

  const user = [
    `Frame center RA=${center.ra.toFixed(6)}, Dec=${center.dec.toFixed(6)}.`,
    `Target ${target.name || "star"} RA=${target.ra.toFixed(6)}, Dec=${target.dec.toFixed(6)}.`,
    inFrame
      ? `The target is inside the frame`
      : `The target is outside the frame check our live finder `,
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
