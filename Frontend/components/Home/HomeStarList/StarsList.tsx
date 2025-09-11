import React from "react";
import { View, Text } from "react-native";
import styles from "./StarsList.styles";
import StarItem, { Star } from "../StarItem/StarItem";

export default function StarsList({
  stars,
  onPressStar,
}: {
  stars: Star[];
  onPressStar?: (s: Star) => void;
}) {
  return (
    <View>
      <View style={styles.head}>
        <Text style={styles.title}>Your Stars ({stars.length})</Text>
      </View>
      {stars.length === 0 ? (
        <View style={styles.emptyWrap}>
          <Text style={styles.emptyText}>You don't own a star yet</Text>
        </View>
      ) : (
        stars.map((s) => (
          <StarItem key={s.id} star={s} onPress={onPressStar} />
        ))
      )}
    </View>
  );
}
