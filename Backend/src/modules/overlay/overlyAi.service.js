import { GoogleGenerativeAI } from "@google/generative-ai";

const MODEL = process.env.GEMINI_MODEL || "gemini-1.5-flash";

export async function starDetectionAI(input) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return {
      message: getBasicMessage(input),
      confidence: "low",
      source: "fallback"
    };
  }

  try {
    const genai = new GoogleGenerativeAI(apiKey);
    const model = genai.getGenerativeModel({ model: MODEL });

    const systemPrompt = `You are an expert astronomy assistant helping users identify stars in their photographs. 
    
Your role is to:
- Confirm whether a specific star was found in the user's photo
- Provide encouraging and helpful responses
- Guide users to use the live finder when stars aren't detected
- Give brief astronomical context when relevant
- Keep responses concise and friendly

Always respond with a JSON object containing:
- "message": A clear, encouraging message about the detection result
- "confidence": "high", "medium", or "low"
- "tips": Array of 1-2 helpful tips (optional)
- "context": Brief astronomical fact about the star (optional)`;

    const userPrompt = buildUserPrompt(input);

    const response = await model.generateContent([
      { role: "user", parts: [{ text: `${systemPrompt}\n\nUser scenario: ${userPrompt}` }] }
    ]);

    const text = response.response.text().trim();

    try {
      const parsed = JSON.parse(text);
      return {
        message: parsed.message || getBasicMessage(input),
        confidence: parsed.confidence || "medium",
        tips: Array.isArray(parsed.tips) ? parsed.tips.slice(0, 2) : [],
        context: parsed.context || null,
        source: "ai",
        raw: text
      };
    } catch {
      return {
        message: text.slice(0, 200) || getBasicMessage(input),
        confidence: "medium",
        source: "ai-text",
        raw: text
      };
    }
  } catch (error) {
    console.error("AI service error:", error);
    return {
      message: getBasicMessage(input),
      confidence: "low",
      source: "fallback",
      error: error.message
    };
  }
}

function buildUserPrompt(input) {
  const { imageAnalyzed, starFound, star, imageCenter, systemError, error } = input;

  if (systemError) {
    return `System error occurred while analyzing image. Error: ${error}. Provide encouraging message to try again.`;
  }

  if (!imageAnalyzed) {
    return `Could not analyze the image for star "${star?.name || 'target star'}". ${star?.constellation ? `It's in constellation ${star.constellation}. ` : ''}Error: ${error}. Guide user to try again with better image or use live finder.`;
  }

  if (starFound) {
    return `SUCCESS! Found star "${star.name}" in the photograph. ${star.magnitude ? `Magnitude: ${star.magnitude}. ` : ''}${star.constellation ? `Constellation: ${star.constellation}. ` : ''}Image center: RA ${imageCenter.ra.toFixed(2)}°, Dec ${imageCenter.dec.toFixed(2)}°. Celebrate this success!`;
  } else {
    return `Star "${star.name}" was not found in the photograph. ${star.magnitude ? `Magnitude: ${star.magnitude}. ` : ''}${star.constellation ? `Constellation: ${star.constellation}. ` : ''}Image center: RA ${imageCenter.ra.toFixed(2)}°, Dec ${imageCenter.dec.toFixed(2)}°. Guide user to use live finder.`;
  }
}

function getBasicMessage(input) {
  const { imageAnalyzed, starFound, star, systemError } = input;
  const starName = star?.name || "your star";

  if (systemError) {
    return "Unable to analyze the image right now. Please try again with a clear photo of the night sky.";
  }

  if (!imageAnalyzed) {
    return `Could not locate ${starName} in this photo. The stars may not be clear enough. Try the live finder to locate it.`;
  }

  if (starFound) {
    return `Great! ${starName} is visible in your photo.`;
  } else {
    return `${starName} is not in this photo. Use the live finder to help locate it in the sky.`;
  }
}
