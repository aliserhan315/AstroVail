import React, { useMemo, useState } from "react";
import { View, Text, Image, ActivityIndicator, ScrollView } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useLocalSearchParams, useRouter } from "expo-router";
import Background from "@/components/Background";
import PrimaryButton from "@/components/ui/PrimaryButton";
import SectionCard from "@/components/ui/SectionCard";
import { Colors } from "@/constants/Colors";
import { OverlayAPI } from "@/lib/endpoint";
import ErrorMessage from "@/components/ui/ErrorMessage";

export default function OverlayCaptureScreen() {
  const { starId } = useLocalSearchParams();
  const id = useMemo(() => (Array.isArray(starId) ? (starId as string[])[0] : (starId as string)), [starId]);
  const router = useRouter();

  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<any | null>(null);
  const [pngUri, setPngUri] = useState<string | null>(null);
  const [picked, setPicked] = useState<{ uri: string } | null>(null);
  const [errorText, setErrorText] = useState<string | null>(null);

  const reset = () => { setResult(null); setPngUri(null); };

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
      setPngUri(null);
      const SLOW_MS = 30000;
      const slowTimer = setTimeout(() => {
        setResult((prev: any) => prev || ({ solved: false, inFrame: null, guidance: { hint: " The star is not be in this photo. Try Live Finder for instant guidance." } }));
      }, SLOW_MS);
      const json = await OverlayAPI.analyze({ uri: picked.uri }, id, "json");
      clearTimeout(slowTimer);
      setResult(json);
    } catch (e: any) {
      setErrorText(e?.message ?? "Overlay analyze failed. Try another image.");
    } finally {
      setBusy(false);
    }
  };

  const getPng = async () => {
    if (!id || !picked || busy) return;
    try {
      setBusy(true);
      const png = await OverlayAPI.analyze({ uri: picked.uri }, id, "png");
      setPngUri(png);
    } catch (e: any) {
      setErrorText(e?.message ?? "PNG overlay failed. Try again.");
    } finally {
      setBusy(false);
    }
  };

  const analyzeLabel = !picked ? "Pick image first" : busy ? "Working..." : "Analyze";
  const pngLabel = !picked ? "Pick image first" : busy ? "Working..." : "Get PNG Overlay";

  return (
    <View style={{ flex: 1 }}>
      <Background />
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16, paddingBottom: 24, gap: 12 }}>
        {errorText && (
          <ErrorMessage text={errorText} onHide={() => setErrorText(null)} />
        )}

        <Text style={{ color: Colors.text, fontSize: 18, fontWeight: "700" }}>Locate Your Star</Text>

        {picked && (
          <SectionCard>
            <Image source={{ uri: picked.uri }} style={{ width: "100%", height: 240, resizeMode: "contain" }} />
          </SectionCard>
        )}

        {result && (
          <SectionCard style={{ gap: 6 }}>
            <Text style={{ color: Colors.text }}>Solved: {String(result.solved)}</Text>
            <Text style={{ color: Colors.text }}>In Frame: {String(result.inFrame)}</Text>
            {result.guidance?.hint && (<Text style={{ color: Colors.tint }}>Hint: {result.guidance.hint}</Text>)}
            {result.ai?.short && (<Text style={{ color: Colors.text }}>AI: {result.ai.short}</Text>)}
            {Array.isArray(result.ai?.steps) && result.ai.steps.length > 0 && (
              <View>
                {result.ai.steps.map((s: string, i: number) => (
                  <Text key={i} style={{ color: Colors.text }}>â€¢ {s}</Text>
                ))}
              </View>
            )}
            {result.solved === false && (
              <PrimaryButton
                text="Open Live Finder"
                onPress={() => id && router.push({ pathname: "/(tabs)/overlay/finder", params: { starId: id } })}
              />
            )}
          </SectionCard>
        )}

        <SectionCard style={{ gap: 10 }}>
          <PrimaryButton text={picked ? "Pick Another Image" : "Pick Sky Image"} onPress={pickImage} />
          <PrimaryButton text={analyzeLabel} onPress={analyze} variant={!picked || busy ? "secondary" : "primary"} />
          <PrimaryButton text={pngLabel} onPress={getPng} variant={!picked || busy ? "secondary" : "primary"} />
          <PrimaryButton text="Open Live Finder" onPress={() => id && router.push({ pathname: "/(tabs)/overlay/finder", params: { starId: id } })} />
          {busy && <ActivityIndicator />}
        </SectionCard>

        {pngUri && (
          <SectionCard>
            <Image source={{ uri: pngUri }} style={{ width: "100%", height: 300, resizeMode: "contain" }} />
          </SectionCard>
        )}
      </ScrollView>
    </View>
  );
}
