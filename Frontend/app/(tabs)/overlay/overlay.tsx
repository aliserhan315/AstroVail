import React, { useMemo, useState } from "react";
import { View, Text, Image, ActivityIndicator, Alert } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useLocalSearchParams } from "expo-router";
import Background from "@/components/Background";
import PrimaryButton from "@/components/ui/PrimaryButton";
import SectionCard from "@/components/ui/SectionCard";
import { Colors } from "@/constants/Colors";
import { OverlayAPI } from "@/lib/endpoint";

export default function OverlayCaptureScreen() {
  const { starId } = useLocalSearchParams();
  const id = useMemo(() => (Array.isArray(starId) ? (starId as string[])[0] : (starId as string)), [starId]);

  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<any | null>(null);
  const [pngUri, setPngUri] = useState<string | null>(null);
  const [picked, setPicked] = useState<{ uri: string } | null>(null);

  const reset = () => { setResult(null); setPngUri(null); };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") { Alert.alert("Permission", "Gallery access denied"); return; }
const out = await ImagePicker.launchImageLibraryAsync({mediaTypes: ["images"], quality: 1,});

    if (out.canceled || !out.assets?.[0]?.uri) return;
    setPicked({ uri: out.assets[0].uri });
    reset();
  };

  const pickCamera = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") { Alert.alert("Permission", "Camera access denied"); return; }
    const out = await ImagePicker.launchCameraAsync({ quality: 1 });
    if (out.canceled || !out.assets?.[0]?.uri) return;
    setPicked({ uri: out.assets[0].uri });
    reset();
  };

  const analyze = async () => {
    if (!id || !picked || busy) return;
    try {
      setBusy(true);
      setPngUri(null);
      const json = await OverlayAPI.analyze({ uri: picked.uri }, id, "json");
      setResult(json);
    } catch (e: any) {
      Alert.alert("Overlay failed", e?.message ?? "Try another image");
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
      Alert.alert("PNG failed", e?.message ?? "Try again");
    } finally {
      setBusy(false);
    }
  };

  const analyzeLabel = !picked ? "Pick image first" : busy ? "Working..." : "Analyze";
  const pngLabel = !picked ? "Pick image first" : busy ? "Working..." : "Get PNG Overlay";

  return (
    <View style={{ flex: 1 }}>
      <Background />
      <View style={{ flex: 1, padding: 16, gap: 12 }}>
        <Text style={{ color: Colors.text, fontSize: 18, fontWeight: "700" }}>Locate Your Star</Text>

        <SectionCard style={{ gap: 10 }}>
          <PrimaryButton text={picked ? "Pick Another Image" : "Pick Sky Image"} onPress={pickImage} />
          <PrimaryButton text="Open Camera" onPress={pickCamera} />
          <PrimaryButton text={analyzeLabel} onPress={analyze} variant={!picked || busy ? "secondary" : "primary"} />
          <PrimaryButton text={pngLabel} onPress={getPng} variant={!picked || busy ? "secondary" : "primary"} />
          {busy && <ActivityIndicator />}
        </SectionCard>

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
                  <Text key={i} style={{ color: Colors.text }}>• {s}</Text>
                ))}
              </View>
            )}
          </SectionCard>
        )}

        {pngUri && (
          <SectionCard>
            <Image source={{ uri: pngUri }} style={{ width: "100%", height: 300, resizeMode: "contain" }} />
          </SectionCard>
        )}
      </View>
    </View>
  );
}