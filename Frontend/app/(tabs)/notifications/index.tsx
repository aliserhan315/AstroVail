import React, { useCallback, useEffect, useState } from "react";
import { View, Text, StatusBar, ActivityIndicator, FlatList, RefreshControl, Alert } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Background from "@/components/Background";
import NotificationCard, { NotiItem } from "@/components/Events/Notificationcard/NotificationCard";
import { NotiAPI } from "@/lib/endpoint";
import { Colors } from "@/constants/Colors";

type RawNoti = {
  _id: string;
  title: string;
  body?: string;
  createdAt?: string;
  readAt?: string | null;
  event?: { title?: string; startTime?: string };
  star?: { displayName?: string; baseName?: string };
};

function formatRightLabel(n: RawNoti) {
  if (n?.event?.startTime) {
    const d = new Date(n.event.startTime);
    const now = new Date();
    const isToday = d.toDateString() === now.toDateString();
    const opts: Intl.DateTimeFormatOptions = { hour: "numeric", minute: "2-digit" };
    const t = d.toLocaleTimeString(undefined, opts).replace(":00", "");
    return isToday ? `Today at ${t}` : d.toLocaleDateString(undefined, { month: "long", day: "numeric" });
  }
  if (n?.createdAt) {
    const d = new Date(n.createdAt);
    const now = new Date();
    const isToday = d.toDateString() === now.toDateString();
    const opts: Intl.DateTimeFormatOptions = { hour: "numeric", minute: "2-digit" };
    const t = d.toLocaleTimeString(undefined, opts).replace(":00", "");
    return isToday ? `Today at ${t}` : d.toLocaleDateString(undefined, { month: "long", day: "numeric" });
  }
  return "";
}

export default function NotificationsScreen() {
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [items, setItems] = useState<NotiItem[]>([]);

  const extract = (p: any) => (Array.isArray(p) ? p : p?.data ?? p ?? []);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const payload = await NotiAPI.list();
      const raw: RawNoti[] = extract(payload);
      setItems(
        raw.map((n) => ({
          _id: n._id,
          title: n.title,
          body: n.body,
          createdAt: n.createdAt,
          readAt: n.readAt,
          event: n.event,
          star: n.star,
        }))
      );
    } catch (e: any) {
      if (e?.response?.status === 401) {
        Alert.alert("Sign in required", "Please sign in to view notifications.");
      } else {
        Alert.alert("Error", e?.message ?? "Failed to load notifications");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try { await load(); } finally { setRefreshing(false); }
  }, [load]);

  return (
    <View style={{ flex: 1, backgroundColor: "#000" }}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      <Background />

      <View style={{ paddingTop: insets.top + 8, paddingHorizontal: 16, marginBottom: 8 }}>
        <Text style={{ color: Colors.text, fontSize: 28, fontWeight: "800" }}>Notifications</Text>
        <Text style={{ color: "#B6B6B6", fontSize: 14, marginTop: 4 }}>Check your notifications</Text>
      </View>

      {loading ? (
        <View style={{ alignItems: "center", marginTop: 24 }}>
          <ActivityIndicator color="#fff" />
        </View>
      ) : items.length === 0 ? (
        <View style={{ alignItems: "center", marginTop: 32, paddingHorizontal: 16 }}>
          <Text style={{ color: "#9CA3AF", fontSize: 14 }}>No notifications yet</Text>
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(n) => n._id}
          renderItem={({ item }) => (
            <NotificationCard
              noti={item}
              rightLabel={formatRightLabel(item as unknown as RawNoti)}
            />
          )}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#fff" />
          }
          contentContainerStyle={{ paddingBottom: insets.bottom + 28 }}
        />
      )}
    </View>
  );
}
