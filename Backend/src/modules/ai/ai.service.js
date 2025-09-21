import { z } from "zod";
import { GoogleGenerativeAI } from "@google/generative-ai";

export const CertificateMessageSchema = z.object({
  recipientName: z.string().optional(),
  buyerName: z.string().optional(),
  star: z.object({
    baseName: z.string().nullable().optional(),
    displayName: z.string().nullable().optional(),
    constellation: z.string().nullable().optional(),
    ra: z.number().nullable().optional(),
    dec: z.number().nullable().optional(),
    magnitude: z.number().nullable().optional(),
  }).optional(),
  style: z.enum(["classic", "modern", "cosmic"]),
  tone: z.enum(["short","friendly","romantic","fun","formal","inspirational"]).optional(),
  occasionText: z.string().trim().max(200).optional(),
  length: z.enum(["short","medium","long"]).optional(),
  language: z.enum(["en","ar"]).optional(),
  eventDate: z.string().trim().optional(),
  userNotes: z.string().trim().max(400).optional(),
  includeAstronomyFacts: z.boolean().optional(),
  includeConstellationMyth: z.boolean().optional(),
  maxChars: z.number().int().positive().max(2000).optional(),
  count: z.number().int().positive().max(5).optional(),
});

function clamp(str, max = 280) {
  if (!str) return "";
  if (str.length <= max) return str;
  return str.slice(0, max - 1).trimEnd() + "…";
}

function langLabel(lang) {
  return lang === "ar" ? "Arabic" : "English";
}

function prose(lang, en, ar) {
  return lang === "ar" ? ar : en;
}

function buildPrompt(input) {
  const lang = input.language || "en";
  const star = input.star || {};
  const starName = star.displayName || star.baseName || prose(lang, "this star", "هذا النجم");
  const lines = [
    prose(lang,
      "You craft premium dedications for digital star ownership certificates.",
      "أنت تكتب إهداءات مميزة لشهادات ملكية النجوم الرقمية."
    ),
    prose(lang,
      "Write a beautiful, sincere message suitable for printing on a certificate.",
      "اكتب رسالة جميلة وصادقة مناسبة للطباعة على الشهادة."
    ),
    prose(lang,
      `Language: ${langLabel(lang)}. If any details are missing, gracefully omit them.`,
      `اللغة: ${langLabel(lang)}. إذا كانت هناك تفاصيل ناقصة فتجاهلها بسلاسة.`
    ),
    "",
    prose(lang, "Audience & context:", "الجمهور والسياق:"),
    prose(lang, `• Recipient: ${input.recipientName || "—"}`, `• المهدى إليه: ${input.recipientName || "—"}`),
    prose(lang, `• From: ${input.buyerName || "—"}`, `• من: ${input.buyerName || "—"}`),
    prose(lang, `• Occasion: ${input.occasionText || "—"}`, `• المناسبة: ${input.occasionText || "—"}`),
    prose(lang, `• Event date: ${input.eventDate || "—"}`, `• تاريخ الحدث: ${input.eventDate || "—"}`),
    prose(lang, `• Style theme: ${input.style}`, `• نمط الشهادة: ${input.style}`),
    prose(lang, `• Tone: ${input.tone || "short"}`, `• النبرة: ${input.tone || "short"}`),
    prose(lang, `• Star: ${starName}`, `• النجم: ${starName}`),
    prose(lang, `• Constellation: ${star.constellation ?? "—"}`, `• الكوكبة: ${star.constellation ?? "—"}`),
    prose(lang, `• RA: ${star.ra ?? "—"}, Dec: ${star.dec ?? "—"}, Mag: ${star.magnitude ?? "—"}`,
               `• المطلع: ${star.ra ?? "—"}، الميل: ${star.dec ?? "—"}، اللمعان: ${star.magnitude ?? "—"}`),
    input.userNotes ? prose(lang, `• Notes from buyer: ${input.userNotes}`, `• ملاحظات من المُرسل: ${input.userNotes}`) : "",
    "",
    prose(lang, "Must-haves:", "متطلبات أساسية:"),
    prose(lang, "• 1–3 sentences depending on length preference.", "• من جملة إلى ثلاث جُمل حسب الطول المطلوب."),
    prose(lang, "• Warm, human, and tasteful. Avoid clichés.", "• دافئة وطبيعية وراقية. تجنب العبارات المبتذلة."),
    prose(lang, "• No emojis. No links. No sales language. No NASA/official naming claims.", "• بدون رموز تعبيرية أو روابط أو لغة تسويقية أو ادعاءات تسمية رسمية."),
    input.includeAstronomyFacts
      ? prose(lang, "• If natural, weave in a subtle astronomy detail about the star (coordinates, magnitude, or visibility).", "• إن أمكن، أدرج لمحة فلكية لطيفة عن النجم (الإحداثيات أو اللمعان أو إمكانية الرؤية).")
      : "",
    input.includeConstellationMyth
      ? prose(lang, "• Optionally include a tasteful nod to the constellation’s myth or symbolism if it fits.", "• يمكن تضمين إشارة لطيفة لأسطورة الكوكبة أو رمزيتها إذا لاقت السياق.")
      : "",
    "",
    prose(lang, "Length guidance:", "إرشادات الطول:"),
    prose(lang,
      `• Preference: ${input.length || "short"} (but maximum ${input.maxChars || 280} characters).`,
      `• التفضيل: ${input.length || "short"} (بحد أقصى ${input.maxChars || 280} حرفًا).`
    ),
    "",
    prose(lang, "Output:", "المخرج:"),
    prose(lang, "• Return only the dedication text, no quotes or prefixes.", "• أعد نص الإهداء فقط بدون علامات اقتباس أو مقدمات."),
  ].filter(Boolean);

  return lines.join("\n");
}

export function parseCertificateRequest(body = {}) {
  return CertificateMessageSchema.parse(body);
}

export async function generateCertificateMessage(input, opts = {}) {
  const parsed = parseCertificateRequest(input);
  const maxChars = parsed.maxChars ?? Number(process.env.AI_MAX_CHARS || 280);
  const apiKey = opts.apiKey || process.env.GEMINI_API_KEY;
  if (!apiKey) return { text: "", truncated: false, model: null, reason: "missing_api_key" };

  const modelName = opts.model || "gemini-1.5-flash";
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: modelName });

  const prompt = buildPrompt(parsed);
  const result = await model.generateContent(prompt);
  const raw = (result?.response?.text?.() || "").trim();
  const text = clamp(raw, maxChars);

  return { text, truncated: text.length < raw.length, model: modelName };
}
