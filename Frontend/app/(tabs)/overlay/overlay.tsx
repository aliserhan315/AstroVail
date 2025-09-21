import React, { useMemo, useState } from "react";
import { View, Text, Image, ActivityIndicator, ScrollView } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useLocalSearchParams, useRouter } from "expo-router";

import Background from "@/components/Background";
import PrimaryButton from "@/components/ui/PrimaryButton";
import SectionCard from "@/components/ui/SectionCard";
import ErrorMessage from "@/components/ui/ErrorMessage";
import { Colors } from "@/constants/Colors";
import { OverlayAPI } from "@/lib/endpoint";
import AnalysisResultCard from "@/components/overlay/AnalysisResultCard";
import type { StarDetectionResult } from "@/types/overlay";

export default function OverlayCaptureScreen() {
  const { starId } = useLocalSearchParams();
  const id = useMemo(() => (Array.isArray(starId) ? (starId as string[])[0] : (starId as string)), [starId]);
  const router = useRouter();

  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<StarDetectionResult | null>(null);
  const [picked, setPicked] = useState<{ uri: string } | null>(null);
  const [errorText, setErrorText] = useState<string | null>(null);

  const reset = () => setResult(null);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") { setErrorText("Gallery access denied"); return; }
    const out = await ImagePicker.launchImageLibraryAsync({ quality: 1 });
    if (out.canceled || !out.assets?.[0]?.uri) return;
    setPicked({ uri: out.assets[0].uri });
    reset();
  };

  const analyze = async () => {
    if (!id || !picked || busy) return;
    try {
      setBusy(true);
      const SLOW_MS = 30000;
      const slowTimer = setTimeout(() => {
        setResult({
          starFound: false,
          message: "The star is not in this photo. Try Live Finder for instant guidance.",
          starName: "your star",
          imageAnalyzed: false,
          ai: { message: "Analysis timed out", confidence: "low", source: "timeout" },
        });
      }, SLOW_MS);

      const json = await OverlayAPI.analyzeStarDetection({ uri: picked.uri }, id);
      clearTimeout(slowTimer);
      setResult(json);
    } catch (e: any) {
      setErrorText(e?.message ?? "Overlay analyze failed. Try another image.");
    } finally {
      setBusy(false);
    }
  };

  const analyzeLabel = !picked ? "Pick image first" : busy ? "Working..." : "Analyze";

  return (
    <View style={{ flex: 1 }}>
      <Background />
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16, paddingBottom: 24, gap: 12 }}>
        {errorText && <ErrorMessage text={errorText} onHide={() => setErrorText(null)} />}

        <Text style={{ color: Colors.text, fontSize: 18, fontWeight: "700" }}>Locate Your Star</Text>

        {picked && (
          <SectionCard>
            <Image source={{ uri: picked.uri }} style={{ width: "100%", height: 240, resizeMode: "contain" }} />
          </SectionCard>
        )}

        {result && (
          <AnalysisResultCard
            result={result}
            onOpenFinder={() => id && router.push({ pathname: "/(tabs)/overlay/finder", params: { starId: id } })}
          />
        )}

        <SectionCard style={{ gap: 10 }}>
          <PrimaryButton text={picked ? "Pick Another Image" : "Pick Sky Image"} onPress={pickImage} />
          <PrimaryButton text={analyzeLabel} onPress={analyze} variant={!picked || busy ? "secondary" : "primary"} />
          <PrimaryButton text="Open Live Finder" onPress={() => id && router.push({ pathname: "/(tabs)/overlay/finder", params: { starId: id } })} />
          {busy && <ActivityIndicator />}
        </SectionCard>
      </ScrollView>
    </View>
  );
}