import React, { useRef, useState } from "react";
import {
  View,
  Text,
  ImageBackground,
  FlatList,
  TouchableOpacity,
  useWindowDimensions,
  StatusBar,
  Platform,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import styles from "./styles";

const slides = [
  {
    key: "1",
    title: "Discover the Universe",
    text: "The universe is vast and full of wonders waiting to be discovered. Every star has its own story, and every constellation paints a picture in the night sky.",
    image: require("../../assets/images/info1.jpeg"),
  },
  {
    key: "2",
    title: "Your Cosmic Journey",
    text: "AstroVail brings the stars to your fingertips. Whether you want to learn, explore, or share the magic with someone special, your journey starts here.",
    image: require("../../assets/images/info2.jpg"),
  },
  {
    key: "3",
    title: "Explore the Stars",
    text: "Ready to navigate galaxies, name stars, and unlock cosmic secrets? Let's begin this adventure together.",
    image: require("../../assets/images/info31.jpg"),
  },
] as const;

type Slide = (typeof slides)[number];

export default function Onboarding() {
  const router = useRouter();
  const listRef = useRef<FlatList<Slide>>(null);
  const [index, setIndex] = useState(0);
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  const onNext = () => {
    if (index < slides.length - 1) {
      listRef.current?.scrollToIndex({ index: index + 1, animated: true });
    }
  };

  const finishOnboarding = async () => {
    await AsyncStorage.setItem("av_seen_onboarding", "true");
    router.replace({ pathname: "/(auth)/login" });
  };

  const onSkip = finishOnboarding;

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      {index < slides.length - 1 && (
        <TouchableOpacity
          onPress={onSkip}
          style={[styles.skipBtn, { top: insets.top + 8 }]}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
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
          <View style={{ width, height }}>
            <ImageBackground source={item.image} resizeMode="cover" style={styles.bgImage}>
              <LinearGradient
                colors={["rgba(0,0,0,0.10)", "rgba(0,0,0,0.45)", "rgba(0,0,0,0.85)"]}
                start={{ x: 0.5, y: 0 }}
                end={{ x: 0.5, y: 1 }}
                style={styles.gradientOverlay}
              />
            </ImageBackground>

            {item.key !== "3" && (
              <View style={styles.titleWrap}>
                <Text style={styles.slideTitle}>{item.title}</Text>
              </View>
            )}

            <View style={styles.contentWrap}>
              {item.key !== "3" ? (
                <Text style={styles.paragraph}>{item.text}</Text>
              ) : (
                <BlurView intensity={Platform.OS === "ios" ? 30 : 20} tint="dark" style={styles.glass}>
                  <Text style={styles.glassTitle}>{item.title}</Text>
                  <Text style={styles.glassText}>{item.text}</Text>

                  <TouchableOpacity onPress={finishOnboarding} activeOpacity={0.9} style={styles.ctaWrap}>
                    <LinearGradient
                      colors={["#2563EB", "#1E40AF"]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.ctaGradient}
                    >
                      <Text style={styles.ctaText}>Get your Star</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </BlurView>
              )}
            </View>

            <View style={styles.dotsRow}>
              {slides.map((_, i) => (
                <View key={i} style={[styles.dot, i === index && styles.dotActive]} />
              ))}
            </View>

            {index < slides.length - 1 && item.key !== "3" && (
              <TouchableOpacity onPress={onNext} style={styles.nextFab} activeOpacity={0.8}>
                <Text style={styles.nextIcon}>→</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      />
    </View>
  );
}
