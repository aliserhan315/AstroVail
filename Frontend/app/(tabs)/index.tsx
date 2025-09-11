import React, { useCallback, useEffect, useMemo, useState } from "react";
import { View, StatusBar, ScrollView, RefreshControl} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";

import { MeAPI, StarsAPI, AuthAPI } from "@/lib/endpoint";
import Background from "@/components/Background";
import Header from "@/components/Home/HomeHeader/Header";
import Hero from "@/components/Home/Hero/Hero";
import SkyPanel from "@/components/Home/SkyPanel/SkyPanel";
import StarsList from "@/components/Home/HomeStarList/StarsList";
import { Star } from "@/components/Home/StarItem/StarItem";

import { useAppDispatch, useAppSelector } from "@/state/hooks";
import { logout as logoutAction } from "@/state/slices/authSlice";

function firstNameFromDisplay(displayName?: string | null) {
  if (!displayName) return "Explorer";
  const first = displayName.trim().split(/\s+/).filter(Boolean)[0];
  return first || "Explorer";
}

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const dispatch = useAppDispatch();

  const user = useAppSelector((s) => s.auth.user);

  const [name, setName] = useState<string>(firstNameFromDisplay(user?.displayName) || "Explorer");
  const [stars, setStars] = useState<Star[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const load = useCallback(async () => {
    const me = await MeAPI.get().catch(() => null);
    const mine = await StarsAPI.mine().catch(() => ({ items: [] as Star[] }));

    const n =
      firstNameFromDisplay(me?.displayName) ||
      firstNameFromDisplay((me as any)?.name) ||
      firstNameFromDisplay(user?.displayName) ||
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
  }, [user?.displayName]);

  useEffect(() => { load(); }, [load]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try { await load(); } finally { setRefreshing(false); }
  }, [load]);

  const starsLite = useMemo(
    () => stars.map((s) => ({ id: s.id, name: s.name })),
    [stars]
  );

  const onLogout = useCallback(async () => {
    if (loggingOut) return;
    setLoggingOut(true);
    try {
      await AuthAPI.logout();        
    } catch {}
    finally {
      dispatch(logoutAction());
      router.replace("/(auth)/login");
      setLoggingOut(false);
    }
  }, [dispatch, router, loggingOut]);

  return (
    <View style={{ flex: 1, backgroundColor: "#000" }}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      <Background />

      <Header
        topInset={insets.top}
        onBellPress={() => router.push("/notifications")}
        onLogoutPress={onLogout}
      />
    

      <ScrollView
        contentContainerStyle={{ paddingBottom: insets.bottom + 28 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#fff" />
        }
      >
        <Hero name={name} />
        <SkyPanel
          stars={starsLite}
          onReposition={() => {}}
        />
        <StarsList stars={stars} onPressStar={(s) => router.push({ pathname: "/(tabs)/star/[starId]", params: { starId: s.id } })} />

      </ScrollView>
    </View>
  );
}
