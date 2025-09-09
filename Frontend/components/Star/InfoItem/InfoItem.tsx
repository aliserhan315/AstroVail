import React from "react";
import { Text, View } from "react-native";
import { styles } from "./InfoItem.styles";


export default function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.item}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value} numberOfLines={1}>{value}</Text>
    </View>
  );
}


