import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import styles from "./Header.styles";

export default function Header({
  topInset,
  onBellPress,
  onLogoutPress,
}: {
  topInset: number;
  onBellPress?: () => void;
  onLogoutPress?: () => void;
}) {
  return (
    <View style={[styles.wrap, { paddingTop: topInset + 6 }]}>
      <Text style={styles.brand}>AstroVail</Text>
      <View style={{ flexDirection: "row", gap: 10 }}>
        <TouchableOpacity
          activeOpacity={0.8}
          style={styles.iconBtn}
          onPress={onBellPress}
        >
          <Ionicons name="notifications-outline" size={20} color="#FFFFFF" />
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.8}
          style={styles.iconBtn}
          onPress={onLogoutPress}
        >
          <Ionicons name="log-out-outline" size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </View>
  );
}
