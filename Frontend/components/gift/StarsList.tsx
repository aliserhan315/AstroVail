import React from "react";
import { View, Text, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { useAppDispatch } from "@/state/hooks";
import { removeItem } from "@/state/slices/cartSlice";
import { CartAPI } from "@/lib/endpoint";
import GiftStarPill from "@/components/gift/GIftStarPill/GiftStarPill";
import CertificatePreviewButton from "@/components/gift/CertificatePreviewButton/CertificatePreviewButton";
import { BASE_URL } from "@/lib/api";
import { CertificateStyle, CartItem } from "@/types/cart";
import styles from "../../app/(tabs)/gift/gift.styles";

interface StarsListProps {
  items: CartItem[];
  selectedStyle: CertificateStyle;
  mode: "gift" | "self";
  recipientEmail: string;
  message: string;
}

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

export default function StarsList({ 
  items, 
  selectedStyle, 
  mode, 
  recipientEmail, 
  message 
}: StarsListProps) {
  const router = useRouter();
  const dispatch = useAppDispatch();

  const pills = items.map((it) => ({
    id: it.starId,
    name: it.starName,
    mag: it.price != null ? String(it.price) : "0.03",
    ra: "18h36m",
    dec: "+38°47′",
    constellation: "Lyra",
  }));

  const handleRemoveStar = async (starId: string) => {
    dispatch(removeItem(starId));
    try {
      await CartAPI.remove(starId);
    } catch (error) {
      console.warn("Failed to remove from backend:", error);
    }
  };

  return (
    <View>
      <View style={styles.rowBetween}>
        <Text style={styles.rowLabel}>Chosen Stars ({items.length})</Text>
        <Pressable onPress={() => router.push("/(tabs)/Stars")} style={styles.addMoreBtn}>
          <Text style={styles.addMoreText}>Add More Stars</Text>
        </Pressable>
      </View>
      
      {pills.map((star) => {
        const styleWire = styleToWire(selectedStyle);
        return (
          <View key={star.id} style={{ marginBottom: 12 }}>
            <GiftStarPill
              star={star}
              onRemove={() => handleRemoveStar(star.id)}
            />
            <CertificatePreviewButton
              baseUrl={BASE_URL}
              starId={star.id}
              styleWire={styleWire}
              recipientEmail={mode === "gift" ? recipientEmail : ""}
              message={mode === "gift" ? message : ""}
            />
          </View>
        );
      })}
    </View>
  );
}

