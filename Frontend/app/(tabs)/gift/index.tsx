import React, { useState } from "react";
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
import styles from "./gift.styles";

import { CartAPI, CheckoutAPI, StarsAPI } from "@/lib/endpoint";

export default function GiftScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const items = useAppSelector((s) => s.cart.items);

  const [mode, setMode] = useState<"gift" | "self">("gift");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const pills = items.map((it) => ({
    id: it.starId,
    name: it.starName,
    mag: it.price != null ? String(it.price) : "0.03",
    ra: "18h36m",
    dec: "+38°47′",
    constellation: "Lyra",
  }));

  const setStyle = (style: CertificateStyle) => {
    items.forEach((it) =>
      dispatch(updateItem({ starId: it.starId, patch: { certificateStyle: style } }))
    );
  };

  const onConfirm = async () => {
    try {
      const patch =
        mode === "gift"
          ? { recipientEmail: email.trim() || undefined }
          : { recipientEmail: undefined };

      const failed: { id: string; reason: string }[] = [];
      for (const it of items) {
        try {
          await CartAPI.add(it.starId, it.qty ?? 1);
          await CartAPI.update(it.starId, patch);
          dispatch(
            updateItem({
              starId: it.starId,
              patch: { ...patch, message: mode === "gift" ? message : undefined },
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
          try { await CartAPI.remove(f.id); } catch {}
        }
        Alert.alert(
          "Some stars are unavailable",
          `Removed ${failed.length} purchased star(s) from your cart. Please review and try again.`
        );
        return;
      }
      const order = await CheckoutAPI.create();

      if (order?.status === "paid") {
        dispatch(clear());
        router.replace("/(tabs)"); 
      } else if (order?.status === "failed_sold_out") {
        const soldOut: string[] = [];
        for (const it of items) {
          try {
            const star = await StarsAPI.get(it.starId);
            const doc: any = star?.data ?? star;
            if (doc?.owner) {
              soldOut.push(it.starId);
            }
          } catch {}
        }
        if (soldOut.length > 0) {
          for (const id of soldOut) {
            dispatch(removeItem(id));
            try { await CartAPI.remove(id); } catch {}
          }
        }
       
      }
    } catch (e: any) {
      console.log(e);
    }
  };

  const generateWithAI = () => {
    setMessage("Write your custom message here — a short, heartfelt note that travels with your star.");
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

          {pills.map((s) => (
            <GiftStarPill
              key={s.id}
              star={s}
              onRemove={async () => {
                dispatch(removeItem(s.id));
                try { await CartAPI.remove(s.id); } catch {}
              }}
            />
          ))}

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
                onRightButtonPress={generateWithAI}
                style={{ marginTop: 12 }}
              />
            </>
          )}

          <Text style={styles.sectionLabel}>Certificate style:</Text>
          <View style={styles.pillsRow}>
            <Pressable onPress={() => setStyle(CertificateStyle.Classic)} style={styles.pill}>
              <Text style={styles.pillText}>Classic</Text>
            </Pressable>
            <Pressable onPress={() => setStyle(CertificateStyle.Cosmic)} style={styles.pill}>
              <Text style={styles.pillText}>Cosmic</Text>
            </Pressable>
          </View>

          <Button
            title={mode === "gift" ? "Confirm Gift" : "Buy Stars"}
            variant={ButtonVariant.Primary}
            onPress={onConfirm}
            style={styles.cta}
          />
        </View>
      </ScrollView>
    </View>
  );
}
