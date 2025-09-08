import React, { useEffect } from "react";
import { View, Text, StatusBar, Image } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter, useRootNavigationState } from "expo-router";
import { useAppSelector } from "@/state/hooks";
import Background from "@/components/Background";
import { Colors } from "@/constants/Colors";

const LOGO = require("../assets/images/AstroVailLogo.png");
const ONBOARDING_KEY = "av_seen_onboarding";

export default function IndexGate() {
  const router = useRouter();
  const navState = useRootNavigationState();
  const insets = useSafeAreaInsets();
  const loggedIn = useAppSelector(s => !!s.auth.accessToken);

  useEffect(() => {
    if (!navState?.key) return;
    let cancelled = false;
    const MIN_SHOW_MS = 1000;
    const started = Date.now();

    (async () => {
      try {
        const seen = await AsyncStorage.getItem(ONBOARDING_KEY);

        const elapsed = Date.now() - started;
        if (elapsed < MIN_SHOW_MS) await new Promise(r => setTimeout(r, MIN_SHOW_MS - elapsed));
        if (cancelled) return;

        if (!seen) router.replace("/onboarding");
        else if (loggedIn) router.replace("/(tabs)");
        else router.replace("/(auth)/login");
      } catch {
        if (!cancelled) router.replace("/(auth)/login");
      }
    })();

    return () => { cancelled = true; };
  }, [navState?.key, router, loggedIn]);

  return (
    <View style={{ flex: 1, backgroundColor: "#000" }}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      <Background />
      <View style={{
        flex: 1, paddingTop: insets.top + 40, paddingBottom: insets.bottom + 24,
        alignItems: "center", justifyContent: "center",
      }}>
        <View style={{
          width: 110, height: 110, borderRadius: 55, backgroundColor: "rgba(255,255,255,0.10)",
          alignItems: "center", justifyContent: "center", marginBottom: 16,
        }}>
          <Image source={LOGO} accessibilityLabel="AstroVail logo" style={{ width: 78, height: 78, resizeMode: "contain" }} />
        </View>
        <Text style={{ color: Colors.text, fontSize: 28, letterSpacing: 0.5 }}>AstroVail</Text>
        <View style={{ position: "absolute", bottom: insets.bottom + 28, alignItems: "center" }}>
          <Text style={{ color: Colors.text, fontSize: 16, opacity: 0.9 }}>Created By</Text>
          <Text style={{ color: Colors.text, fontSize: 16, opacity: 0.9 }}>Ali Serhan</Text>
        </View>
      </View>
    </View>
  );
}
