import React from "react";
import { View, Text, Pressable } from "react-native";
import styles from "./GiftStarPill.styles";

export type GiftStar = {
  id: string;
  name: string;
  ra?: string;
  dec?: string;
  mag?: string;
  constellation?: string;
};

export default function GiftStarPill({
  star,
  onRemove,
}: {
  star: GiftStar;
  onRemove?: () => void;
}) {
  return (
    <View style={styles.wrap}>
      <View style={styles.topRow}>
        <Text style={styles.name}>✨  {star.name}</Text>
        <Text style={styles.metaRight}>
          RA {star.ra ?? "—"} · DEC {star.dec ?? "—"}
        </Text>
        {onRemove ? (
          <Pressable onPress={onRemove} style={styles.close}>
            <Text style={styles.closeText}>x</Text>
          </Pressable>
        ) : null}
      </View>
      <Text style={styles.sub}>
        Mag {star.mag ?? "-"} · {star.constellation ?? "-"}
      </Text>
    </View>
  );
}
