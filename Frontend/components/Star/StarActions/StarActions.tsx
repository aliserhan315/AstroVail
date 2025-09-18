import React from "react";
import { View } from "react-native";
import { router } from "expo-router";
import StoryCard from "@/components/Star/StoryCard/StoryCard";
import PrimaryButton from "@/components/ui/PrimaryButton";
import SectionCard from "@/components/ui/SectionCard";
import { styles } from "./StarActions.styles";

interface StarActionsProps {
  isOwned: boolean;
  star: any;
  story: string;
  onEditStar: () => void;
  onViewCertificate: () => void;
  onLocateInSky: () => void;
  onAddToGift: () => void;
}

export default function StarActions({
  isOwned,
  star,
  story,
  onEditStar,
  onViewCertificate,
  onLocateInSky,
  onAddToGift
}: StarActionsProps) {
  if (isOwned) {
    return (
      <StoryCard
        title={`🌟 The Story of ${star.displayName ?? star.baseName}${
          star.displayName ? ` (formerly ${star.baseName})` : ""
        }`}
        body={star?.story?.trim() ? (star.story as string) : story}
        footer={
          <View style={styles.ownedActionsContainer}>
            <PrimaryButton
              text="Locate in Sky"
              onPress={onLocateInSky}
            />
            <PrimaryButton
              text="Edit Star"
              onPress={onEditStar}
            />
            <PrimaryButton
              text="View Certificate"
              onPress={onViewCertificate}
            />
          </View>
        }
      />
    );
  }

  return (
    <SectionCard style={styles.unownedActionsContainer}>
      <PrimaryButton text="Add To Cart" onPress={onAddToGift} />
      <PrimaryButton text="Send As Gift" onPress={onAddToGift} />
      <PrimaryButton 
        text="Check Similar Stars" 
        variant="secondary" 
        onPress={() => router.push("/(tabs)/Stars")} 
      />
    </SectionCard>
  );
}