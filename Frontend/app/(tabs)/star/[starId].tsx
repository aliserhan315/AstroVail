import React, { useEffect, useMemo, useState } from "react";
import {ActivityIndicator,ScrollView,StyleSheet,Text,  View,  Pressable, Modal, Alert} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useLocalSearchParams, router } from "expo-router";

import Background from "@/components/Background";
import { Colors } from "@/constants/Colors";
import { StarsAPI, CartAPI } from "@/lib/endpoint";
import StarInfoCard from "@/components/Star/starInfoCard/StarInfoCard";
import StoryCard from "@/components/Star/StoryCard/StoryCard";
import PrimaryButton from "@/components/ui/PrimaryButton";
import SectionCard from "@/components/ui/SectionCard";
import LabeledInput from "@/components/ui/LabeledInput";

import { useAppDispatch } from "@/state/hooks";
import { addOrUpdateItem } from "@/state/slices/cartSlice";
import { CertificateStyle } from "@/types/cart";

type Owner = { _id: string; name?: string | null };
type StarDoc = {
  _id: string;
  baseName: string;
  displayName?: string | null;
  story?: string | null;
  constellation?: string | null;
  magnitude?: number;
  ra?: number;
  dec?: number;
  owner?: string | Owner | null;
};

type StarForCard = {
  baseName: string;
  displayName?: string | null;
  magnitude?: number;
  constellation?: string | null;
  owner?: { name?: string | null } | null;
};

function toStarForCard(s: StarDoc): StarForCard {
  return {
    baseName: s.baseName,
    displayName: s.displayName ?? null,
    magnitude: s.magnitude,
    constellation: s.constellation ?? null,
    owner:
      typeof s.owner === "string" || !s.owner
        ? null
        : { name: s.owner.name ?? null },
  };
}

export default function StarDetailsScreen() {
  const { starId } = useLocalSearchParams();
  const insets = useSafeAreaInsets();
  const dispatch = useAppDispatch();

  const [star, setStar] = useState<StarDoc | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newStory, setNewStory] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        const idParam = Array.isArray(starId) ? starId[0] : starId;
        if (!idParam || typeof idParam !== "string") {
          if (alive) {
            setErr("Invalid star id");
            setLoading(false);
          }
          return;
        }
        const payload = await StarsAPI.get(idParam);
        const doc: StarDoc = (payload?.data ?? payload) as StarDoc;
        if (alive) setStar(doc);
      } catch (e: any) {
        if (alive) setErr(e?.message ?? "Failed to load star");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [starId]);

  const uiStar = useMemo<StarForCard | null>(
    () => (star ? toStarForCard(star) : null),
    [star]
  );

  const ownerId = useMemo(() => {
    if (!star?.owner) return undefined;
    return typeof star.owner === "string" ? star.owner : star.owner._id;
  }, [star]);

  const ownerName = useMemo(() => {
    if (!star?.owner || typeof star.owner === "string") return undefined;
    return star.owner.name ?? undefined;
  }, [star]);

  const isOwned = !!ownerId;

  const headerTitle = useMemo(() => {
    if (!star) return "—";
    const renamed = !!(star.displayName && star.displayName !== star.baseName);
    return renamed
      ? `${star.displayName}`
      : star.displayName ?? star.baseName;
  }, [star]);

  const story = useMemo(() => {
    if (!star || !isOwned) return "";
    const renamed = !!(star.displayName && star.displayName !== star.baseName);
    const who = ownerName ?? "its owner";
    const prettyNew = star.displayName ?? star.baseName;
    const prettyOld = star.baseName;
    if (!renamed) {
      return `Once known as ${prettyOld} and kept under the same name, this star is personally owned by ${who}. 
      Its legacy is preserved on AstroVail’s registry.`;
    }
    return `Once known to astronomers as ${prettyOld}, the brilliant beacon of the ${
      star.constellation ?? "night"
    } constellation has been given a new chapter in its cosmic journey. Through AstroVail’s 
    star registry, its light has been renamed ${prettyNew}. This renaming was permanently recorded on 
    the blockchain, ensuring that for generations to come, ${prettyOld} will be remembered not just as a scientific landmark,
     but as a personal tribute carrying the name ${prettyNew}.`;
  }, [star, isOwned, ownerName]);

  if (loading) {
    return (
      <View style={[styles.fill, styles.center]}>
        <Background />
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (err || !star) {
    return (
      <View style={[styles.fill, styles.center, { padding: 24 }]}>
        <Background />
        <Text style={styles.error}>{err ?? "Star not found."}</Text>
        <PrimaryButton
          text="Go Back"
          onPress={() => router.back()}
          style={{ marginTop: 12 }}
        />
      </View>
    );
  }

  const handleAddToGift = async () => {
    if (!star) return;
    try {
      await CartAPI.add(star._id, 1);
    } catch (e: any) {
      const msg = e?.response?.data?.message || e?.message || "Star already purchased";
      Alert.alert("Unavailable", msg);
      return;
    }

    dispatch(
      addOrUpdateItem({
        starId: star._id,
        starName: star.displayName ?? star.baseName,
        qty: 1,
        certificateStyle: CertificateStyle.Classic,
        price: 0.03,
      })
    );
    router.push("/(tabs)/gift");
  };

  return (
    <View style={styles.fill}>
      <Background />
      <ScrollView
        contentContainerStyle={[
          styles.scrollPad,
          { paddingTop: insets.top + 12, paddingBottom: insets.bottom + 24 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Pressable onPress={() => router.back()} style={{ marginBottom: 8 }}>
          <Text style={{ color: Colors.tint, fontSize: 16 }}>← Back</Text>
        </Pressable>

        <View style={{ alignItems: "center", marginBottom: 8 }}>
          <Text style={{ fontSize: 36, marginBottom: 6 }}>🌟</Text>
          <Text style={{ color: Colors.text, fontSize: 28, fontWeight: "800" }}>
            {headerTitle}
          </Text>
          <Text style={{ color: Colors.tint, fontSize: 14, marginTop: 4 }}>
            {(star.constellation ?? "—") + " Constellation"}
          </Text>
        </View>

        {uiStar && <StarInfoCard star={uiStar} isOwned={isOwned} />}

        {isOwned ? (
          <StoryCard
            title={`🌟 The Story of ${star.displayName ?? star.baseName}${
              star.displayName ? ` (formerly ${star.baseName})` : ""
            }`}
            body={star?.story?.trim() ? (star.story as string) : story}
            footer={
              <View style={{ gap: 12 }}>
                <PrimaryButton
                  text="Edit Star"
                  onPress={() => {
                    setNewName(star.displayName ?? "");
                    setNewStory(star.story ?? "");
                    setEditOpen(true);
                  }}
                />
                <PrimaryButton
                  text="Check Similar Stars"
                  variant="secondary"
                  onPress={() => router.push("/(tabs)/Stars")}
                />
              </View>
            }
          />
        ) : (
          <SectionCard style={{ gap: 12, marginTop: 8 }}>
            <PrimaryButton text="Add To Gift" onPress={handleAddToGift} />
            <PrimaryButton text="Send As Gift" onPress={handleAddToGift} />
            <PrimaryButton
              text="Check Similar Stars"
              variant="secondary"
              onPress={() => router.push("/(tabs)/Stars")}
            />
          </SectionCard>
        )}
      </ScrollView>

      <Modal visible={editOpen} animationType="slide" transparent>
        <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.6)", justifyContent: "center", padding: 20 }}>
          <SectionCard style={{ padding: 16, gap: 12 }}>
            <Text style={{ color: Colors.text, fontSize: 20, fontWeight: "700" }}>Edit Your Star</Text>
            <LabeledInput
              label="Name"
              value={newName}
              onChangeText={setNewName}
              placeholder="New display name"
              autoCapitalize="words"
            />
            <LabeledInput
              label="Story"
              value={newStory}
              onChangeText={setNewStory}
              placeholder="Write your star’s story"
              multiline
              style={{ marginTop: 8 }}
            />
            <View style={{ flexDirection: "row", gap: 12, marginTop: 8 }}>
              <PrimaryButton
                text={saving ? "Saving..." : "Save"}
                onPress={async () => {
                  if (!star) return;
                  try {
                    setSaving(true);
                    const patch: any = {};
                    patch.displayName = newName.trim();
                    patch.story = newStory; 
                    const updated = await StarsAPI.update(star._id, patch);
                    const doc: StarDoc = (updated?.data ?? updated) as any;
                    setStar(doc);
                    setEditOpen(false);
                  } catch (e: any) {
                    Alert.alert("Update failed", e?.response?.data?.message ?? e?.message ?? "Please try again");
                  } finally {
                    setSaving(false);
                  }
                }}
              />
              <PrimaryButton
                text="Cancel"
                variant="secondary"
                onPress={() => setEditOpen(false)}
              />
            </View>
          </SectionCard>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  center: { justifyContent: "center", alignItems: "center" },
  scrollPad: { paddingHorizontal: 20, gap: 16 },
  error: { color: Colors.onPrimary, fontSize: 16, textAlign: "center" },
});
