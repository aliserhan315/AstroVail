import { useState } from "react";
import { Alert } from "react-native";
import { CartAPI, StarsAPI, AIAPI } from "@/lib/endpoint";
import { CertificateStyle, CartItem } from "@/types/cart";
import type { AILanguage } from "@/types/ai";

function styleToWire(s?: CertificateStyle): "classic" | "modern" | "cosmic" {
  switch (s) {
    case CertificateStyle.Modern:
      return "modern";
    case CertificateStyle.Cosmic:
      return "cosmic";
    default:
      return "classic";
  }
}

export function useGiftAI(
  items: CartItem[],
  selectedStyle: CertificateStyle,
  mode: "gift" | "self",
  email: string,
  setMessage: (message: string) => void,
  updateItem: (starId: string, patch: any) => void
) {
  const [aiVisible, setAiVisible] = useState(false);
  const [aiGenerating, setAiGenerating] = useState(false);
  const [aiLang, setAiLang] = useState<AILanguage>("en");
  const [aiOccasionText, setAiOccasionText] = useState<string>("");

  const handleGenerate = async ({
    language,
    occasionText,
  }: {
    language?: AILanguage;
    occasionText?: string;
  }) => {
    if (items.length === 0) {
      Alert.alert("Pick a star first", "Choose at least one star to personalize.");
      return;
    }

    setAiLang(language || "en");
    setAiOccasionText(occasionText || "");
    setAiGenerating(true);

    try {
      const primary = items[0];
      let starDoc: any = null;
      
      try {
        const response = await StarsAPI.get(primary.starId);
        starDoc = response?.data || response;
      } catch (starError) {
        console.warn("Failed to fetch star details:", starError);
      }

      const payload = {
        recipientName: mode === "gift" ? (email.trim() || undefined) : undefined,
        style: styleToWire(primary.certificateStyle as CertificateStyle),
        language: language || "en",
        occasionText: occasionText || undefined,
        maxChars: 280,
        count: 1,
        star: starDoc ? {
          baseName: starDoc.baseName ?? null,
          displayName: starDoc.displayName ?? null,
          constellation: starDoc.constellation ?? null,
          ra: starDoc.ra ?? null,
          dec: starDoc.dec ?? null,
          magnitude: starDoc.magnitude ?? null,
        } : undefined,
      };

      const response = await AIAPI.certificateMessage(payload);
      const text = String(response?.text || "").trim();
      
      if (!text) {
        Alert.alert("No suggestion", "AI didn't return a message. Try again.");
        return;
      }

      setMessage(text);
      
      const updatePromises = items.map(async (item) => {
        try {
          await CartAPI.update(item.starId, { message: text });
          updateItem(item.starId, { message: text });
        } catch (error) {
          console.warn(`Failed to update message for star ${item.starId}:`, error);
        }
      });

      await Promise.allSettled(updatePromises);
      setAiVisible(false);
      
    } catch (error: any) {
      console.error("AI generation error:", error);
      Alert.alert(
        "AI error", 
        error?.response?.data?.message || error?.message || "Try again."
      );
    } finally {
      setAiGenerating(false);
    }
  };

  return {
    aiVisible,
    aiGenerating,
    aiLang,
    aiOccasionText,
    setAiVisible,
    handleGenerate,
  };
}