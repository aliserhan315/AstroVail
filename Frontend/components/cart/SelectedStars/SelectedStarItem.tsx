import React from "react";
import { View, Pressable, Text } from "react-native";
import StarItem, { Star } from "@/components/Home/StarItem/StarItem";
import styles from "./SelectedStars.style";

export default function SelectedStarItem({
  star,
  onRemove,
}: {
  star: Star;
  onRemove?: () => void;
}) {
  return (
    <View style={styles.root}>
      <View style={{ position: "relative" }}>
        <StarItem star={star} />
        {onRemove ? (
          <Pressable onPress={onRemove} style={styles.closeBtn}>
            <Text style={styles.closeText}>x</Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}
