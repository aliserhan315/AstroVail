import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import styles from "./Header.styles";

export default function Header({
  topInset,
  onBellPress,
}: {
  topInset: number;
  onBellPress?: () => void;
}) {
  return (
    <View style={[styles.wrap, { paddingTop: topInset + 6 }]}>
      <Text style={styles.brand}>AstroVail</Text>
      <TouchableOpacity activeOpacity={0.8} style={styles.iconBtn} onPress={onBellPress}>
        <Ionicons name="notifications-outline" size={20} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  );
}
