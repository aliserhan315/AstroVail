import React, { useRef, useState } from "react";
import { View, Text, StyleSheet, Dimensions, FlatList, Image, TouchableOpacity, StatusBar } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";

const { width, height } = Dimensions.get("window");

const slides = [
  {
    key: "1",
    title: "Claim Your Star",
    subtitle: "Pick a real star from verified catalogs and make it yours.",
    image: { uri: "https://images.unsplash.com/photo-1462331940025-496dfbfc7564?q=80&w=1600&auto=format&fit=crop" },
  },
  {
    key: "2",
    title: "Personalize & Share",
    subtitle: "AI stories, custom constellations, and gift-ready certificates.",
    image: { uri: "https://images.unsplash.com/photo-1462332420958-a05d1e002413?q=80&w=1600&auto=format&fit=crop" },
  },
  {
    key: "3",
    title: "Explore the Night Sky",
    subtitle: "Find your star with the sky map and get cosmic alerts.",
    image: { uri: "https://images.unsplash.com/photo-1444703686981-a3abbc4d4fe3?q=80&w=1600&auto=format&fit=crop" },
  },
] as const;

type Slide = (typeof slides)[number];

export default function Onboarding() {
  const router = useRouter();
  const listRef = useRef<FlatList<Slide>>(null);
  const [index, setIndex] = useState(0);

  const onNext = () => {
    if (index < slides.length - 1) {
      listRef.current?.scrollToIndex({ index: index + 1, animated: true });
    }
  };

  const onSkip = async () => {
    await AsyncStorage.setItem("av_seen_onboarding", "true");
    router.replace("/(tabs)");
  };

  const onStart = async () => {
    await AsyncStorage.setItem("av_seen_onboarding", "true");
    router.replace("/(tabs)");
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient
        colors={["#0B0F1A", "#0A1322", "#07101D"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      {index < slides.length - 1 ? (
        <TouchableOpacity onPress={onSkip} style={styles.skipBtn}>
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
      ) : (
        <View style={styles.skipPlaceholder} />
      )}

      <FlatList
        ref={listRef}
        data={slides}
        keyExtractor={(item) => item.key}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(e) => {
          const i = Math.round(e.nativeEvent.contentOffset.x / width);
          setIndex(i);
        }}
        renderItem={({ item }) => (
          <View style={[styles.slide, { width }]}>            
            <View style={styles.illustrationWrap}>
              <Image source={item.image} resizeMode="cover" style={styles.illustration} />
              <View style={styles.sunGlow} />
            </View>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.subtitle}>{item.subtitle}</Text>
          </View>
        )}
      />

      <View style={styles.dotsRow}>
        {slides.map((_, i) => (
          <View key={i} style={[styles.dot, i === index && styles.dotActive]} />)
        )}
      </View>

      <View style={styles.bottomBar}>
        {index < slides.length - 1 ? (
          <TouchableOpacity onPress={onNext} style={styles.nextBtn}>
            <Text style={styles.nextText}>Next</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity onPress={onStart} style={styles.startBtn}>
            <Text style={styles.startText}>Let’s Start</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  skipBtn: {
    position: "absolute",
    right: 20,
    top: 16,
    zIndex: 10,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  skipPlaceholder: { height: 40 },
  skipText: { color: "#E2E8F0", fontWeight: "600" },
  slide: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 24 },
  illustrationWrap: { width: "100%", height: height * 0.45, alignItems: "center", justifyContent: "center" },
  illustration: { width: "100%", height: "100%", borderRadius: 18 },
  sunGlow: {
    position: "absolute",
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: "#EEE5BF",
    opacity: 0.05,
    bottom: -20,
  },
  title: { color: "#FFFFFF", fontSize: 28, fontWeight: "800", textAlign: "center", marginTop: 12 },
  subtitle: { color: "#CBD5E1", fontSize: 16, textAlign: "center", marginTop: 8, lineHeight: 22 },
  dotsRow: { flexDirection: "row", justifyContent: "center", alignItems: "center", gap: 8, marginBottom: 16 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: "#334155" },
  dotActive: { backgroundColor: "#B4CDED", width: 18 },
  bottomBar: { paddingHorizontal: 24, paddingBottom: 28 },
  nextBtn: { backgroundColor: "rgba(255,255,255,0.08)", paddingVertical: 14, borderRadius: 14, alignItems: "center" },
  nextText: { color: "#E2E8F0", fontWeight: "700", fontSize: 16 },
  startBtn: {
    backgroundColor: "#B4CDED",
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: "center",
    shadowColor: "#B4CDED",
    shadowOpacity: 0.35,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
  },
  startText: { color: "#0B0F1A", fontWeight: "800", fontSize: 16 },
});
