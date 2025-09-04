import React, { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, Text, View, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Background from "@/components/Background";
import { Colors } from "@/constants/Colors";
import { StarsAPI } from "@/lib/endpoint";
import StarInfoCard from "@/components/Star/StarInfoCard";
import StoryCard from "@/components/Star/StoryCard";
import PrimaryButton from "@/components/ui/PrimaryButton";
import SectionCard from "@/components/ui/SectionCard";
import { useLocalSearchParams, useNavigation } from "expo-router";

type Owner = { _id: string; name?: string | null };
type StarDoc = {
  _id: string;
  baseName: string;
  displayName?: string | null;
  constellation?: string | null;
  magnitude?: number;
  ra?: number;
  dec?: number;
  owner?: string | Owner | null;
};

export default function StarDetailsScreen() {
  const { starId } = useLocalSearchParams();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  const [star, setStar] = useState<StarDoc | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        const idParam = Array.isArray(starId) ? starId[0] : starId;
        if (!idParam || typeof idParam !== "string") {
          if (alive) { setErr("Invalid star id"); setLoading(false); }
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
    return () => { alive = false; };
  }, [starId]);

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
    return renamed ? `${star.baseName}/${star.displayName}` : (star.displayName ?? star.baseName);
  }, [star]);

  const story = useMemo(() => {
    if (!star || !isOwned) return "";
    const renamed = !!(star.displayName && star.displayName !== star.baseName);
    const who = ownerName ?? "its owner";
    const prettyNew = star.displayName ?? star.baseName;
    const prettyOld = star.baseName;
    if (!renamed) {
      return `Once known as ${prettyOld} and kept under the same name, this star is personally owned by ${who}. Its legacy is preserved on AstroVail’s registry.`;
    }
    return `Once known to astronomers as ${prettyOld}, the brilliant beacon of the ${star.constellation ?? "night"} constellation has been given a new chapter in its cosmic journey. Through AstroVail’s star registry, its light has been renamed ${prettyNew}. This renaming was permanently recorded on the blockchain, ensuring that for generations to come, ${prettyOld} will be remembered not just as a scientific landmark, but as a personal tribute carrying the name ${prettyNew}.`;
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
        <PrimaryButton text="Go Back" onPress={() => (navigation as any).goBack()} style={{ marginTop: 12 }} />
      </View>
    );
  }

  return (
    <View style={styles.fill}>
      <Background />
      <ScrollView
        contentContainerStyle={[styles.scrollPad, { paddingTop: insets.top + 12, paddingBottom: insets.bottom + 24 }]}
        showsVerticalScrollIndicator={false}
      >
        <Pressable onPress={() => (navigation as any).goBack()} style={{ marginBottom: 8 }}>
          <Text style={{ color: Colors.tint, fontSize: 16 }}>← Back</Text>
        </Pressable>

        <View style={{ alignItems: "center", marginBottom: 8 }}>
          <Text style={{ fontSize: 36, marginBottom: 6 }}>🌟</Text>
          <Text style={{ color: Colors.text, fontSize: 28, fontWeight: "800" }}>{headerTitle}</Text>
          <Text style={{ color: Colors.tint, fontSize: 14, marginTop: 4 }}>
            {(star.constellation ?? "—") + " Constellation"}
          </Text>
        </View>
        <StarInfoCard star={star} isOwned={isOwned} />

        {isOwned ? (
          <StoryCard
            title={`🌟 The Story of ${star.displayName ?? star.baseName}${star.displayName ? ` (formerly ${star.baseName})` : ""}`}
            body={story}
            footer={
              <>
                <PrimaryButton
                  text="Check owner"
                  onPress={() => (navigation as any).navigate("OwnerProfile", { id: ownerId })}
                />
                <PrimaryButton
                  text="Check Similar Stars"
                  variant="secondary"
                  onPress={() => (navigation as any).navigate("SimilarStars", { starId: star._id })}
                />
              </>
            }
          />
        ) : (
          <SectionCard style={{ gap: 12, marginTop: 8 }}>
            <PrimaryButton text="Add To Cart" onPress={() => (navigation as any).navigate("CartAdd", { starId: star._id })} />
            <PrimaryButton text="Send As Gift" onPress={() => (navigation as any).navigate("GiftFlow", { starId: star._id })} />
            <PrimaryButton text="Check Similar Stars" variant="secondary" onPress={() => (navigation as any).navigate("SimilarStars", { starId: star._id })} />
          </SectionCard>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  center: { justifyContent: "center", alignItems: "center" },
  scrollPad: { paddingHorizontal: 20, gap: 16 },
  error: { color: Colors.onPrimary, fontSize: 16, textAlign: "center" },
});
