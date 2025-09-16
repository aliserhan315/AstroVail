import React, { useMemo, useState } from "react";
import { View, Text, ScrollView, StatusBar, Pressable, Alert } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import Background from "@/components/Background";
import Segmented from "@/components/ui/Segmented";
import LabeledInput from "@/components/ui/LabeledInput";
import Button from "@/components/ui/Button";
import { ButtonVariant } from "@/types/ui";
import { useAppDispatch, useAppSelector } from "@/state/hooks";
import { updateItem, removeItem, clear } from "@/state/slices/cartSlice";
import { CertificateStyle } from "@/types/cart";
import GiftStarPill from "@/components/gift/GiftStarPill";
import CertificatePreviewButton from "@/components/gift/CertificatePreviewButton";
import styles from "./gift.styles";
import { CartAPI, CheckoutAPI, StarsAPI, AIAPI } from "@/lib/endpoint";
import { BASE_URL } from "@/lib/api";
import GiftAIQuickModal from "@/components/gift/GiftAIQuickModal";
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

export default function GiftScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const items = useAppSelector((s) => s.cart.items);

  const [mode, setMode] = useState<"gift" | "self">("gift");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [aiVisible, setAiVisible] = useState(false);
  const [aiGenerating, setAiGenerating] = useState(false);
  const [aiLang, setAiLang] = useState<AILanguage>("en");
  const [aiOccasionText, setAiOccasionText] = useState<string>("");

  const pills = items.map((it) => ({
    id: it.starId,
    name: it.starName,
    mag: it.price != null ? String(it.price) : "0.03",
    ra: "18h36m",
    dec: "+38°47′",
    constellation: "Lyra",
  }));

  const selectedStyle = useMemo<CertificateStyle>(() => {
    const s = items?.[0]?.certificateStyle as CertificateStyle | undefined;
    return s || CertificateStyle.Classic;
  }, [items]);

  const setStyle = (style: CertificateStyle) => {
    items.forEach((it) =>
      dispatch(updateItem({ starId: it.starId, patch: { certificateStyle: style } }))
    );
  };

  const onConfirm = async () => {
    if (items.length === 0) {
      Alert.alert("Your cart is empty", "Pick a star first.");
      return;
    }
    if (mode === "gift" && !email.trim()) {
      Alert.alert("Recipient email required", "Add who should receive the certificate.");
      return;
    }
    setSubmitting(true);
    try {
      const basePatch =
        mode === "gift"
          ? { recipientEmail: email.trim() || undefined }
          : { recipientEmail: undefined };
      const failed: { id: string; reason: string }[] = [];
      for (const it of items) {
        try {
          const styleWire = styleToWire(it.certificateStyle as CertificateStyle);
          await CartAPI.add(it.starId, it.qty ?? 1);
          await CartAPI.update(it.starId, {
            ...basePatch,
            message: mode === "gift" ? message : undefined,
            certificateStyle: styleWire,
          });
          dispatch(
            updateItem({
              starId: it.starId,
              patch: { ...basePatch, message: mode === "gift" ? message : undefined },
            })
          );
        } catch (e: any) {
          const reason = e?.response?.data?.message || e?.message || "Unavailable";
          failed.push({ id: it.starId, reason });
        }
      }
      if (failed.length > 0) {
        for (const f of failed) {
          dispatch(removeItem(f.id));
          try {
            await CartAPI.remove(f.id);
          } catch {}
        }
        Alert.alert("Some stars became unavailable", `Removed ${failed.length} item(s) from your cart. Review and try again.`);
        setSubmitting(false);
        return;
      }
      const order = await CheckoutAPI.create();
      if (order?.status === "paid") {
        dispatch(clear());
        Alert.alert("Success", "Your order is complete. Certificates are being generated.");
        router.replace("/(tabs)");
      } else if (order?.status === "failed_sold_out") {
        const soldOut: string[] = [];
        for (const it of items) {
          try {
            const star = await StarsAPI.get(it.starId);
            const doc: any = star?.data ?? star;
            if (doc?.owner) soldOut.push(it.starId);
          } catch {}
        }
        if (soldOut.length > 0) {
          for (const id of soldOut) {
            dispatch(removeItem(id));
            try {
              await CartAPI.remove(id);
            } catch {}
          }
        }
      } else {
        router.replace("/(tabs)");
      }
    } catch {}
    finally {
      setSubmitting(false);
    }
  };

  const handleGenerateOpen = () => setAiVisible(true);

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
        starDoc = await StarsAPI.get(primary.starId);
      } catch {}
      const payload = {
        recipientName: mode === "gift" ? (email.trim() || undefined) : undefined,
        style: styleToWire(primary.certificateStyle as CertificateStyle),
        language: language || "en",
        occasionText: occasionText || undefined,
        maxChars: 280,
        count: 1,
        star: starDoc
          ? {
              baseName: starDoc.baseName ?? null,
              displayName: starDoc.displayName ?? null,
              constellation: starDoc.constellation ?? null,
              ra: starDoc.ra ?? null,
              dec: starDoc.dec ?? null,
              magnitude: starDoc.magnitude ?? null,
            }
          : undefined,
      };
      const out = await AIAPI.certificateMessage(payload);
      const text = String(out?.text || "").trim();
      if (!text) {
        Alert.alert("No suggestion", "AI didn’t return a message. Try again.");
        return;
      }
      setMessage(text);
      for (const it of items) {
        try {
          await CartAPI.update(it.starId, { message: text });
          dispatch(updateItem({ starId: it.starId, patch: { message: text } }));
        } catch {}
      }
      setAiVisible(false);
    } catch (e: any) {
      Alert.alert("AI error", e?.response?.data?.message || e?.message || "Try again.");
    } finally {
      setAiGenerating(false);
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
          <Segmented
            options={[
              { label: "Buying as gift", value: "gift" },
              { label: "Buying for myself", value: "self" },
            ]}
            value={mode}
            onChange={(v) => setMode(v as "gift" | "self")}
          />
          <View style={styles.rowBetween}>
            <Text style={styles.rowLabel}>Chosen Stars ({items.length})</Text>
            <Pressable onPress={() => router.push("/(tabs)/Stars")} style={styles.addMoreBtn}>
              <Text style={styles.addMoreText}>Add More Stars</Text>
            </Pressable>
          </View>
          {pills.map((s) => {
            const styleWire = styleToWire(selectedStyle);
            return (
              <View key={s.id}>
                <GiftStarPill
                  star={s}
                  onRemove={async () => {
                    dispatch(removeItem(s.id));
                    try {
                      await CartAPI.remove(s.id);
                    } catch {}
                  }}
                />
                <CertificatePreviewButton
                  baseUrl={BASE_URL}
                  starId={s.id}
                  styleWire={styleWire}
                  recipientEmail={mode === "gift" ? email : ""}
                  message={mode === "gift" ? message : ""}
                />
              </View>
            );
          })}
          {mode === "gift" && (
            <>
              <LabeledInput
                value={email}
                onChangeText={setEmail}
                placeholder="Recipient email"
                keyboardType="email-address"
                autoCapitalize="none"
                style={{ marginTop: 8 }}
              />
              <LabeledInput
                value={message}
                onChangeText={setMessage}
                placeholder="Write your custom message here"
                multiline
                rightButtonText="Generate with AI"
                onRightButtonPress={handleGenerateOpen}
                style={{ marginTop: 12 }}
              />
            </>
          )}
          <Text style={styles.sectionLabel}>Certificate style:</Text>
          <View style={styles.pillsRow}>
            <Pressable onPress={() => setStyle(CertificateStyle.Classic)} style={styles.pill}>
              <Text style={styles.pillText}>Classic</Text>
            </Pressable>
            <Pressable onPress={() => setStyle(CertificateStyle.Modern)} style={styles.pill}>
              <Text style={styles.pillText}>Modern</Text>
            </Pressable>
            <Pressable onPress={() => setStyle(CertificateStyle.Cosmic)} style={styles.pill}>
              <Text style={styles.pillText}>Cosmic</Text>
            </Pressable>
          </View>
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
