import React, { useCallback, useEffect, useMemo, useState } from "react";
import { View, StatusBar, ScrollView, RefreshControl } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MeAPI, StarsAPI } from "@/lib/endpoint";

import Background from "../../components/Background";
import Header from "@/components/Home/Header";
import Hero from "@/components/Home/Hero";
import SkyPanel from "@/components/Home/SkyPanel";
import StarsList from "@/components/Home/HomeStarList/StarsList";
import { Star } from "@/components/Home/StarItem";


function firstNameFromDisplay(displayName?: string | null) {
  if (!displayName) return "Explorer";
  const first = displayName.trim().split(/\s+/).filter(Boolean)[0];
  return first || "Explorer";
}

export default function HomeScreen() {
  const insets = useSafeAreaInsets();

  const [name, setName] = useState<string>("Explorer");
  const [stars, setStars] = useState<Star[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    const me = await MeAPI.get().catch(() => null);

    const mine = await StarsAPI.mine().catch(() => ({ items: [] as Star[] }));

    const n =
      firstNameFromDisplay(me?.displayName) ||
      firstNameFromDisplay(me?.name) ||
      "Explorer";

    setName(n);

    const items = (mine?.items ?? []).map((s: any) => ({
      id: String(s.id ?? s._id),
      name: String(s.name ?? s.designation ?? "Unnamed"),
      mag: s.mag != null ? String(s.mag) : "—",
      ra: s.ra != null ? String(s.ra) : "—",
      dec: s.dec != null ? String(s.dec) : "—",
      constellation: s.constellation ?? s.const ?? "—",
    })) as Star[];

    setStars(items);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await load();
    } finally {
      setRefreshing(false);
    }
  }, [load]);

  const starsLite = useMemo(
    () => stars.map((s) => ({ id: s.id, name: s.name })),
    [stars]
  );

  return (
    <View style={{ flex: 1, backgroundColor: "#000" }}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      <Background />

      <Header topInset={insets.top} onBellPress={() => { /* navigate to notifications */ }} />

      <ScrollView
        contentContainerStyle={{ paddingBottom: insets.bottom + 28 }}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#fff" />}
      >
        <Hero name={name} />
        <SkyPanel
          stars={starsLite}
          onReposition={(pos) => {
          
          }}
        />
        <StarsList stars={stars} onPressStar={(s) => { /* navigate to detail */ }} />
      </ScrollView>
    </View>
  );
}
