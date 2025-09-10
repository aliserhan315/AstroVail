import React, { useState } from "react";
import { View, Text, ScrollView, StatusBar, Pressable, Alert, Linking } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import Background from "@/components/Background";
import Segmented from "@/components/ui/Segmented";
import LabeledInput from "@/components/ui/LabeledInput";
import Button from "@/components/ui/Button";
import { ButtonVariant } from "@/types/ui";
import { useAppDispatch, useAppSelector } from "@/state/hooks";
import { updateItem, removeItem, clear as clearCart } from "@/state/slices/cartSlice";
import { CertificateStyle } from "@/types/cart";
import GiftStarPill from "@/components/gift/GiftStarPill";
import styles from "./gift.styles";

import { CartAPI, CheckoutAPI } from "@/lib/endpoint";

export default function GiftScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const items = useAppSelector((s) => s.cart.items);

  const [mode, setMode] = useState<"gift" | "self">("gift");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

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

  const syncServerCartIfNeeded = async () => {
    if (!items.length) {
      throw new Error("Your cart is empty.");
    }
    try {
      const session = await CheckoutAPI.create();
      return session;
    } catch (e: any) {
      const status = e?.response?.status;
      if (status === 400) {
        // server cart empty -> backfill from local
        await Promise.all(items.map((it) => CartAPI.add(it.starId, it.qty ?? 1)));
        return await CheckoutAPI.create();
      }
      throw e;
    }
  };

  const onConfirm = async () => {
    if (!items.length) {
      Alert.alert("Cart is empty", "Please add a star first.");
      return;
    }
    if (mode === "gift" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      Alert.alert("Invalid email", "Please enter a valid recipient email.");
      return;
    }

    setSubmitting(true);
    try {
      // Save meta to Redux
      items.forEach((it) =>
        dispatch(
          updateItem({
            starId: it.starId,
            patch: { recipientEmail: mode === "gift" ? email.trim() : undefined, message },
          })
        )
      );

      const session = await syncServerCartIfNeeded();
      const checkoutUrl: string | undefined = session?.checkoutUrl;
      const orderId: string | undefined = session?.orderId;

      // DEV path: mock URL -> finalize immediately
      if (orderId && checkoutUrl && /example\.com\/mock-checkout/.test(checkoutUrl)) {
        await CheckoutAPI.finalize(orderId);
        dispatch(clearCart());
        Alert.alert("Success", "Your order is complete. The star is now yours!");
        router.replace("/(tabs)");
        return;
      }

      // Real Stripe checkout
      if (checkoutUrl && /^https?:\/\//i.test(checkoutUrl)) {
        await Linking.openURL(checkoutUrl);
        return;
      }

      // Fallback: finalize if we have an order id
      if (orderId) {
        await CheckoutAPI.finalize(orderId);
        dispatch(clearCart());
        Alert.alert("Success", "Your order is complete. The star is now yours!");
        router.replace("/(tabs)");
        return;
      }

      throw new Error("Could not start checkout.");
    } catch (e: any) {
      Alert.alert("Checkout failed", e?.message ?? "Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const generateWithAI = () => {
    setMessage(
      "Write your custom message here — a short, heartfelt note that travels with your star."
    );
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
                try {
                  await CartAPI.remove(s.id);
                } catch {}
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
            title={submitting ? "Processing..." : mode === "gift" ? "Send Gift" : "Buy Now"}
            variant={ButtonVariant.Primary}
            onPress={onConfirm}
            disabled={submitting}
            style={styles.cta}
          />
        </View>
      </ScrollView>
    </View>
  );
}
