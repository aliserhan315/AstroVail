import React from "react";
import { View, Text, Pressable } from "react-native";
import SectionCard from "@/components/ui/SectionCard";
import { Colors } from "@/constants/Colors";

type RowState = { saving: boolean; enabled: boolean | null };

export default function SettingsCard({
  notif,
  onEnableNotifications,
  loc,
  onEnableLocation,
  onOpenCertificates,
}: {
  notif: RowState;
  onEnableNotifications: () => void;
  loc: RowState;
  onEnableLocation: () => void;
  onOpenCertificates: () => void;
}) {
  return (
    <SectionCard style={{ marginTop: 16 }}>
      <Text style={{ color: Colors.text, fontSize: 16, marginBottom: 8 }}>Settings</Text>

      <SettingRow
        title="Notification"
        subtitle="Enable to get celestial events alerts and more"
        state={notif}
        onPress={onEnableNotifications}
      />

      <Divider />

      <SettingRow
        title="Location"
        subtitle="Set your location and your stars location"
        state={loc}
        onPress={onEnableLocation}
      />

      <Divider />

      <Pressable
        onPress={onOpenCertificates}
        style={{ paddingVertical: 12 }}
        android_ripple={{ color: "rgba(255,255,255,0.1)" } as any}
      >
        <Text style={{ color: Colors.text, fontSize: 16 }}>Certificate Type</Text>
        <Text style={{ color: "#B6B6B6", fontSize: 12, marginTop: 4 }}>
          Choose your certificate style
        </Text>
      </Pressable>
    </SectionCard>
  );
}

function SettingRow({
  title,
  subtitle,
  onPress,
  state,
}: {
  title: string;
  subtitle: string;
  onPress: () => void;
  state: RowState;
}) {
  return (
    <Pressable onPress={onPress} style={{ paddingVertical: 12 }} android_ripple={{ color: "rgba(255,255,255,0.1)" } as any}>
      <Text style={{ color: Colors.text, fontSize: 16 }}>{title}</Text>
      <Text style={{ color: "#B6B6B6", fontSize: 12, marginTop: 4 }}>{subtitle}</Text>
      {state.saving ? (
        <Text style={{ color: Colors.text, fontSize: 12, marginTop: 6 }}>Saving…</Text>
      ) : state.enabled != null ? (
        <Text style={{ color: state.enabled ? "#58d68d" : "#ff9f9f", fontSize: 12, marginTop: 6 }}>
          {state.enabled ? "Enabled" : "Permission denied"}
        </Text>
      ) : null}
    </Pressable>
  );
}

function Divider() {
  return <View style={{ height: 1, backgroundColor: "rgba(255,255,255,0.06)", marginVertical: 8 }} />;
}
