import React from "react";
import { View, Text, ActivityIndicator } from "react-native";
import SectionCard from "@/components/ui/SectionCard";
import { Colors } from "@/constants/Colors";

export default function StatsCard({
  loading,
  ownedStars,
  ownedConstellations,
}: {
  loading: boolean;
  ownedStars: number;
  ownedConstellations: number;
}) {
  return (
    <SectionCard>
      <Text style={{ color: Colors.text, fontSize: 16, marginBottom: 10 }}>Your stats</Text>

      <View style={{ flexDirection: "row", justifyContent: "space-between", gap: 12 }}>
        <Metric loading={loading} value={ownedStars} label="Owned stars" />
        <Metric loading={loading} value={ownedConstellations} label="Owned Constellation" />
      </View>
    </SectionCard>
  );
}

function Metric({ loading, value, label }: { loading: boolean; value: number; label: string }) {
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: "rgba(255,255,255,0.06)",
        paddingVertical: 14,
        paddingHorizontal: 12,
        borderRadius: 12,
        alignItems: "center",
      }}
    >
      {loading ? (
        <ActivityIndicator color="#fff" />
      ) : (
        <>
          <Text style={{ color: Colors.text, fontSize: 22 }}>{value}</Text>
          <Text style={{ color: "#B6B6B6", fontSize: 12, marginTop: 6 }}>{label}</Text>
        </>
      )}
    </View>
  );
}
