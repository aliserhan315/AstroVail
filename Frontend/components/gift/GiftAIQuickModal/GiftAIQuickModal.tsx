import React, { useEffect, useState } from "react";
import { Modal, View, Text, Pressable } from "react-native";
import { Colors } from "@/constants/Colors";
import SectionCard from "@/components/ui/SectionCard";
import Segmented from "@/components/ui/Segmented";
import LabeledInput from "@/components/ui/LabeledInput";
import Button from "@/components/ui/Button";
import { ButtonVariant } from "@/types/ui";
import type { AILanguage } from "@/types/ai";

type Props = {
  visible: boolean;
  defaultLanguage?: AILanguage;
  defaultOccasionText?: string;
  generating?: boolean;
  onCancel: () => void;
  onGenerate: (opts: { language?: AILanguage; occasionText?: string }) => void;
};

const LANGS: { label: string; value: AILanguage }[] = [
  { label: "English", value: "en" },
  { label: "العربية", value: "ar" },
];

export default function GiftAIQuickModal({
  visible,
  defaultLanguage = "en",
  defaultOccasionText = "",
  generating = false,
  onCancel,
  onGenerate,
}: Props) {
  const [language, setLanguage] = useState<AILanguage>(defaultLanguage);
  const [occasionText, setOccasionText] = useState<string>(defaultOccasionText);

  useEffect(() => {
    if (visible) {
      setLanguage(defaultLanguage);
      setOccasionText(defaultOccasionText);
    }
  }, [visible, defaultLanguage, defaultOccasionText]);

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.6)", justifyContent: "center", padding: 18 }}>
        <SectionCard style={{ padding: 16 }}>
          <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 8 }}>
            <Text style={{ fontSize: 18, fontWeight: "800", color: Colors.text, flex: 1 }}>Quick AI Setup</Text>
            <Pressable
              onPress={generating ? undefined : onCancel}
              style={{
                width: 32,
                height: 32,
                borderRadius: 10,
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "rgba(255,255,255,0.08)",
                borderWidth: 1,
                borderColor: "rgba(255,255,255,0.14)",
                opacity: generating ? 0.5 : 1,
              }}
            >
              <Text style={{ color: Colors.text, fontSize: 16 }}>×</Text>
            </Pressable>
          </View>

          <Text style={{ color: Colors.text, opacity: 0.9, fontSize: 12, marginBottom: 10 }}>
            Choose a language and describe the occasion.
          </Text>

          <Text style={{ color: Colors.text, marginBottom: 6, fontWeight: "600" }}>Language</Text>
          <Segmented
            options={LANGS.map((l) => ({ label: l.label, value: l.value }))}
            value={language}
            onChange={(v) => !generating && setLanguage(v as AILanguage)}
          />

          <LabeledInput
            value={occasionText}
            onChangeText={(t) => !generating && setOccasionText(t)}
            placeholder="What kind of gift? (e.g. Birthday for Mom)"
            style={{ marginTop: 12 }}
          />

          <View style={{ flexDirection: "row", gap: 10, marginTop: 16 }}>
            <Button
              title="Cancel"
              variant={ButtonVariant.Ghost}
              onPress={onCancel}
              disabled={generating}
              style={{ flex: 1 }}
            />
            <Button
              title="Generate"
              variant={ButtonVariant.Primary}
              onPress={() => onGenerate({ language, occasionText: occasionText?.trim() || undefined })}
              loading={generating}
              disabled={generating}
              style={{ flex: 1 }}
            />
          </View>
        </SectionCard>
      </View>
    </Modal>
  );
}
