import React from "react";
import { View, Text, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/Colors";

function getInitials(name?: string | null) {
  if (!name) return "";
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const first = parts[0]?.[0] || "";
  const second = parts[1]?.[0] || "";
  return (first + second).toUpperCase();
}

export default function ProfileHeader({
  name,
  subtitle = "Star Explorer",
  avatarUrl,
}: {
  name: string;
  subtitle?: string;
  avatarUrl?: string | null;
}) {
  const initials = getInitials(name);

  return (
    <View style={{ alignItems: "center", marginTop: 4, marginBottom: 20 }}>
      <View
        style={{
          width: 104,
          height: 104,
          borderRadius: 52,
          backgroundColor: "rgba(255,255,255,0.1)",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
        }}
      >
        {avatarUrl ? (
          <Image source={{ uri: avatarUrl }} style={{ width: 104, height: 104 }} />
        ) : initials ? (
          <Text style={{ color: Colors.text, fontSize: 36, fontWeight: "600" }}>{initials}</Text>
        ) : (
          <Ionicons name="person-outline" size={56} color={Colors.text} />
        )}
      </View>
      <Text style={{ color: Colors.text, fontSize: 24, marginTop: 12 }}>{name}</Text>
      <Text style={{ color: "#B6B6B6", fontSize: 14, marginTop: 2 }}>{subtitle}</Text>
    </View>
  );
}
