import React from "react";
import { View, Text, ScrollView, StatusBar } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import Background from "@/components/Background";
import Button from "@/components/ui/Button";
import { ButtonVariant } from "@/types/ui";
import GiftAIQuickModal from "@/components/gift/GiftAIQuickModal";
import GiftModeSelector from "@/components/gift/GiftModeSelector";
import StarsList from "@/components/gift/StarsList";
import GiftDetailsForm from "@/components/gift/GiftDetailsForm";
import CertificateStyleSelector from "@/components/gift/CertificateStyleSelector";
import { useGiftState } from "@/hooks/useGiftState";
import { useGiftAI } from "@/hooks/useGiftAI";
import { GiftService } from "@/components/gift/giftService";
import styles from "./gift.styles";

export default function GiftScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  
  const {
    items,
    mode,
    email,
    message,
    submitting,
    selectedStyle,
    setMode,
    setEmail,
    setMessage,
    setSubmitting,
    setStyle,
    removeItem,
    clearCart,
    updateItem,
  } = useGiftState();

  const {
    aiVisible,
    aiGenerating,
    aiLang,
    aiOccasionText,
    setAiVisible,
    handleGenerate,
  } = useGiftAI(items, selectedStyle, mode, email, setMessage, updateItem);

  const onConfirm = async () => {
    setSubmitting(true);
    
    try {
      const result = await GiftService.processOrder({
        items,
        mode,
        email,
        message,
        onItemUpdate: updateItem,
        onItemRemove: removeItem,
        onClearCart: clearCart,
      });

      if (result.success && result.redirect) {
        router.replace(result.redirect as any);
      }
    } catch (error) {
      console.error("Order processing error:", error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#000" }}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      <Background />
      
      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 24 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.h1}>Gift a Star</Text>
          <Text style={styles.h2}>Make your loved ones happy</Text>
        </View>
        
        <View style={styles.card}>
          <GiftModeSelector mode={mode} onModeChange={setMode} />
          
          <StarsList
            items={items}
            selectedStyle={selectedStyle}
            mode={mode}
            recipientEmail={email}
            message={message}
          />

          {mode === "gift" && (
            <GiftDetailsForm
              email={email}
              message={message}
              onEmailChange={setEmail}
              onMessageChange={setMessage}
              onGenerateAI={() => setAiVisible(true)}
            />
          )}

          <CertificateStyleSelector
            selectedStyle={selectedStyle}
            onStyleChange={setStyle}
          />

          <Button
            title={mode === "gift" ? "Confirm Gift" : "Buy Stars"}
            variant={ButtonVariant.Primary}
            onPress={onConfirm}
            disabled={submitting}
            style={styles.cta}
          />
        </View>
      </ScrollView>

      <GiftAIQuickModal
        visible={aiVisible}
        defaultLanguage={aiLang}
        defaultOccasionText={aiOccasionText}
        generating={aiGenerating}
        onCancel={() => (aiGenerating ? null : setAiVisible(false))}
        onGenerate={handleGenerate}
      />
    </View>
  );
}