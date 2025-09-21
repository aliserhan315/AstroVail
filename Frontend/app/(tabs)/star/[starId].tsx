import React, { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, ScrollView, Text, View, Pressable, Alert } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useLocalSearchParams, router } from "expo-router";
import Background from "@/components/Background";
import { StarsAPI, CartAPI } from "@/lib/endpoint";
import StarInfoCard from "@/components/Star/starInfoCard/StarInfoCard";
import PrimaryButton from "@/components/ui/PrimaryButton";
import { openCertificate } from "@/components/certificate/Crttificatehelper";
import { useAppDispatch } from "@/state/hooks";
import { addOrUpdateItem } from "@/state/slices/cartSlice";
import { CertificateStyle } from "@/types/cart";
import StarHeader from "@/components/Star/StarHeader/StarHeader";
import EditStarModal from "@/components/Star/EditStarModal/EditStarModal";
import StarActions from "@/components/Star/StarActions/StarActions";
import { styles } from "./starDetails.style";

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
    owner: typeof s.owner === "string" || !s.owner ? null : { name: s.owner.name ?? null },
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

  const uiStar = useMemo<StarForCard | null>(() => (star ? toStarForCard(star) : null), [star]);

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
    return renamed ? `${star.displayName}` : star.displayName ?? star.baseName;
  }, [star]);

  const story = useMemo(() => {
    if (!star || !isOwned) return "";
    const renamed = !!(star.displayName && star.displayName !== star.baseName);
    const who = ownerName ?? "its owner";
    const prettyNew = star.displayName ?? star.baseName;
    const prettyOld = star.baseName;
    if (!renamed) {
      return `Once known as ${prettyOld} and kept under the same name, this star is personally owned by ${who}. 
      Its legacy is preserved on AstroVail's registry.`;
    }
    return `Once known to astronomers as ${prettyOld}, the brilliant beacon of the ${
      star.constellation ?? "night"
    } constellation has been given a new chapter in its cosmic journey. Through AstroVail's 
    star registry, its light has been renamed ${prettyNew}. This renaming was permanently recorded on 
    the blockchain, ensuring that for generations to come, ${prettyOld} will be remembered not just as a scientific landmark,
     but as a personal tribute carrying the name ${prettyNew}.`;
  }, [star, isOwned, ownerName]);

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

  const handleEditStar = () => {
    setEditOpen(true);
  };

  const handleViewCertificate = () => {
    if (!star) return;
    openCertificate({
      starId: star._id,
      style: "cosmic",
      recipientEmail: "",
      message: star.story || "",
    });
  };

  const handleLocateInSky = () => {
    if (!star) return;
    router.push({ pathname: "/(tabs)/overlay/overlay", params: { starId: star._id } });
  };

  const handleUpdateStar = async (newName: string, newStory: string) => {
    if (!star) return;
    
    const patch: any = {};
    patch.displayName = newName.trim();
    patch.story = newStory;
    
    const updated = await StarsAPI.update(star._id, patch);
    const doc: StarDoc = (updated?.data ?? updated) as any;
    setStar(doc);
    setEditOpen(false);
  };

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
      <View style={[styles.fill, styles.center, styles.errorContainer]}>
        <Background />
        <Text style={styles.error}>{err ?? "Star not found."}</Text>
        <PrimaryButton text="Go Back" onPress={() => router.back()} style={styles.backButton} />
      </View>
    );
  }

  return (
    <View style={styles.fill}>
      <Background />
      <ScrollView
        contentContainerStyle={[styles.scrollPad, { 
          paddingTop: insets.top + 12, 
          paddingBottom: insets.bottom + 24 
        }]}
        showsVerticalScrollIndicator={false}
      >
        <Pressable onPress={() => router.back()} style={styles.backButtonContainer}>
          <Text style={styles.backButtonText}>← Back</Text>
        </Pressable>

        <StarHeader 
          title={headerTitle}
          constellation={star.constellation ?? "—"}
        />

        {uiStar && <StarInfoCard star={uiStar} isOwned={isOwned} />}

        <StarActions
          isOwned={isOwned}
          star={star}
          story={story}
          onEditStar={handleEditStar}
          onViewCertificate={handleViewCertificate}
          onLocateInSky={handleLocateInSky}
          onAddToGift={handleAddToGift}
        />
      </ScrollView>

      <EditStarModal
        visible={editOpen}
        star={star}
        onClose={() => setEditOpen(false)}
        onSave={handleUpdateStar}
      />
    </View>
  );
}