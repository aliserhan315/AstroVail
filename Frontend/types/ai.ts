export type AITone =
  | "short"
  | "friendly"
  | "romantic"
  | "fun"
  | "formal"
  | "inspirational";

export type AIOccasion =
  | "birthday"
  | "anniversary"
  | "valentines"
  | "wedding"
  | "graduation"
  | "new_baby"
  | "memorial"
  | "get_well"
  | "congrats"
  | "holiday"
  | "custom";

export type AILength = "short" | "medium" | "long";
export type AILanguage = "en" | "ar";

export type AICertificateMessagePayload = {
  recipientName?: string;
  buyerName?: string;
  star?: {
    baseName?: string | null;
    displayName?: string | null;
    constellation?: string | null;
    ra?: number | null;
    dec?: number | null;
    magnitude?: number | null;
  };
  style: "classic" | "modern" | "cosmic";
  tone?: AITone;
  occasion?: AIOccasion;
  length?: AILength;
  language?: AILanguage;
  eventDate?: string;
  userNotes?: string;
  includeAstronomyFacts?: boolean;
  includeConstellationMyth?: boolean;
  maxChars?: number;
  count?: number;
};

export type AICertificateMessageResponse = {
  text: string;
  texts?: string[];
};
