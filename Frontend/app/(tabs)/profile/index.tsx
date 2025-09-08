import React, { useCallback, useEffect, useMemo, useState } from "react";
import { View, StatusBar } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import * as Location from "expo-location";
import Background from "@/components/Background";
import ProfileHeader from "@/components/Profile/ProfileHeader";
import StatsCard from "@/components/Profile/StatsCard";
import SettingsCard from "@/components/Profile/SettingsCard";
import { MeAPI, StarsAPI } from "@/lib/endpoint";
import { useRouter } from "expo-router";
import { useAppDispatch } from "@/state/hooks";
import { setUser } from "@/state/slices/authSlice";
import {styles} from "./ProfileScreen.styles";

type Me = { _id: string; email: string; displayName?: string | null; avatarUrl?: string | null };

function firstNameFromDisplay(displayName?: string | null) {
  if (!displayName) return "User Name";
  const [first] = displayName.trim().split(/\s+/).filter(Boolean);
  return first || "User Name";
}

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const dispatch = useAppDispatch();

  const [me, setMe] = useState<Me | null>(null);
  const [stars, setStars] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [notifSaving, setNotifSaving] = useState(false);
  const [notifEnabled, setNotifEnabled] = useState<null | boolean>(null);
  const [locSaving, setLocSaving] = useState(false);
  const [locEnabled, setLocEnabled] = useState<null | boolean>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [meDoc, mine] = await Promise.all([
        MeAPI.get().catch(() => null),
        StarsAPI.mine().catch(() => ({ items: [] })),
      ]);
      setMe(meDoc);
      if (meDoc) dispatch(setUser(meDoc));
      setStars((mine as any)?.items || []);
    } finally {
      setLoading(false);
    }
  }, [dispatch]);

  useEffect(() => {
    load();
  }, [load]);

  const ownedStars = useMemo(() => (Array.isArray(stars) ? stars.length : 0), [stars]);
  const ownedConstellations = useMemo(() => {
    const s = new Set<string>();
    for (const it of stars) {
      const c = it.constellation ?? it.const ?? null;
      if (typeof c === "string" && c.trim()) s.add(c.trim());
    }
    return s.size;
  }, [stars]);

  async function enableNotifications() {
    if (!Device.isDevice) {
      setNotifEnabled(false);
      return;
    }
    try {
      setNotifSaving(true);
      const { status: existing } = await Notifications.getPermissionsAsync();
      let status = existing;
      if (existing !== "granted") status = (await Notifications.requestPermissionsAsync()).status;
      if (status !== "granted") {
        setNotifEnabled(false);
        return;
      }
      const token = (await Notifications.getExpoPushTokenAsync()).data;
      await MeAPI.updateDevice({ token });
      setNotifEnabled(true);
    } finally {
      setNotifSaving(false);
    }
  }

  async function enableLocation() {
    try {
      setLocSaving(true);
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setLocEnabled(false);
        return;
      }
      const pos = await Location.getCurrentPositionAsync({});
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
      await MeAPI.updateDevice({
        tz,
        location: {
          lat: pos.coords.latitude,
          lon: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
        },
      });
      setLocEnabled(true);
    } finally {
      setLocSaving(false);
    }
  }

  const name = firstNameFromDisplay(me?.displayName);

  return (
    <View style={styles.root}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      <Background />

      <View
        style={[
          styles.content,
          { paddingTop: insets.top + 12, paddingBottom: insets.bottom + 20 },
        ]}
      >
        <ProfileHeader name={name} avatarUrl={me?.avatarUrl ?? null} />

        <StatsCard
          loading={loading}
          ownedStars={ownedStars}
          ownedConstellations={ownedConstellations}
        />

        <SettingsCard
          notif={{ saving: notifSaving, enabled: notifEnabled }}
          onEnableNotifications={enableNotifications}
          loc={{ saving: locSaving, enabled: locEnabled }}
          onEnableLocation={enableLocation}
          onOpenCertificates={() => router.push("/certificate")}
        />
      </View>
    </View>
  );
}
