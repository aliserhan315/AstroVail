import React, { useCallback, useEffect, useState } from "react";
import { View, Text, StatusBar, ActivityIndicator, FlatList, RefreshControl, Alert, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Background from "@/components/Background";
import EventCard, { EventItem } from "@/components/Events/EventCard/EventCard";
import { EventsAPI } from "@/lib/endpoint";
import { Colors } from "@/constants/Colors";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useEventsReminder } from "@/hooks/useEventsReminder";


type RawEvent = {
  _id: string; title: string; description?: string;
  startTime?: string; endTime?: string;
};

function formatDateRange(startISO?: string, endISO?: string) {
  if (!startISO) return "—";
  const start = new Date(startISO);
  const end = endISO ? new Date(endISO) : undefined;
  const opts: Intl.DateTimeFormatOptions = { month: "long", day: "numeric" };
  const startStr = start.toLocaleDateString(undefined, opts);
  if (!end) return startStr;
  const sameMonth = start.getMonth() === end.getMonth() && start.getFullYear() === end.getFullYear();
  const endOpts: Intl.DateTimeFormatOptions = sameMonth ? { day: "numeric" } : opts;
  const endStr = end.toLocaleDateString(undefined, endOpts);
  return `${startStr}–${endStr}`;
}

export default function EventsScreen() {
  const insets = useSafeAreaInsets();
 
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [items, setItems] = useState<EventItem[]>([]);
  const { setReminder, isSaving, isReminded } = useEventsReminder();

  const extract = (p: any) => (Array.isArray(p) ? p : p?.data ?? p ?? []);
  const mapEvent = (e: RawEvent): EventItem => ({
    _id: e._id, title: e.title, description: e.description, startTime: e.startTime, endTime: e.endTime,
  });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const payload = await EventsAPI.list({ from: new Date().toISOString() });
      const raw = extract(payload);
      setItems(raw.map(mapEvent));
    } catch (e: any) {
      Alert.alert("Error", e?.message ?? "Failed to load events");
    } finally { setLoading(false); }
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

      <View style={{ paddingTop: insets.top + 8, paddingHorizontal: 16, marginBottom: 8, flexDirection: "row", alignItems: "center" }}>
        <View style={{ flex: 1 }}>
          <Text style={{ color: Colors.text, fontSize: 28, fontWeight: "800" }}>Celestial Events</Text>
          <Text style={{ color: "#B6B6B6", fontSize: 14, marginTop: 4 }}>Don’t miss these phenomena</Text>
        </View>
        <Pressable onPress={() => router.push("/notifications")}>
          <Ionicons name="notifications-outline" size={22} color={Colors.text} />
        </Pressable>
      </View>

      {loading ? (
        <View style={{ alignItems: "center", marginTop: 24 }}>
          <ActivityIndicator color="#fff" />
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(e) => e._id}
          renderItem={({ item }) => (
            <EventCard
              event={item}
              dateLabel={formatDateRange(item.startTime, item.endTime)}
              onRemind={setReminder}
              saving={isSaving(item._id)}
              reminded={isReminded(item._id)}
            />
          )}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#fff" />}
          contentContainerStyle={{ paddingBottom: insets.bottom + 28 }}
        />
      )}
    </View>
  );
}
