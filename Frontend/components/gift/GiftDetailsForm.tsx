import React from "react";
import { View } from "react-native";
import LabeledInput from "@/components/ui/LabeledInput";

interface GiftDetailsFormProps {
  email: string;
  message: string;
  onEmailChange: (email: string) => void;
  onMessageChange: (message: string) => void;
  onGenerateAI: () => void;
}

export default function GiftDetailsForm({
  email,
  message,
  onEmailChange,
  onMessageChange,
  onGenerateAI,
}: GiftDetailsFormProps) {
  return (
    <View>
      <LabeledInput
        value={email}
        onChangeText={onEmailChange}
        placeholder="Recipient email"
        keyboardType="email-address"
        autoCapitalize="none"
        style={{ marginTop: 8 }}
      />
      <LabeledInput
        value={message}
        onChangeText={onMessageChange}
        placeholder="Write your custom message here"
        multiline
        rightButtonText="Generate with AI"
        onRightButtonPress={onGenerateAI}
        style={{ marginTop: 12 }}
      />
    </View>
  );
}