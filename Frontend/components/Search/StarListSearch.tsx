import React from "react";
import { View, Text } from "react-native";
import styles from "../Home/StarsList.styles";
import StarItem, { Star } from "../Home/StarItem";

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
      
      </View>
      {stars.map((s) => (
        <StarItem key={s.id} star={s} onPress={onPressStar} />
      ))}
    </View>
  );
}
