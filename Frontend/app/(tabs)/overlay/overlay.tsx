import React, { useMemo, useState } from "react";
import { View, Text, Image, ActivityIndicator, Linking, ScrollView } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useLocalSearchParams } from "expo-router";
import Background from "@/components/Background";
import PrimaryButton from "@/components/ui/PrimaryButton";
import SectionCard from "@/components/ui/SectionCard";
import { Colors } from "@/constants/Colors";
import { OverlayAPI } from "@/lib/endpoint";
import ErrorMessage from "@/components/ui/ErrorMessage";

export default function OverlayCaptureScreen() {
  const { starId } = useLocalSearchParams();
  const id = useMemo(() => (Array.isArray(starId) ? (starId as string[])[0] : (starId as string)), [starId]);

  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<any | null>(null);
  const [pngUri, setPngUri] = useState<string | null>(null);
  const [picked, setPicked] = useState<{ uri: string } | null>(null);
  const [errorText, setErrorText] = useState<string | null>(null);

  const reset = () => { setResult(null); setPngUri(null); };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") { setErrorText("Gallery access denied"); return; }
    const out = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ["images"], quality: 1 });
    if (out.canceled || !out.assets?.[0]?.uri) return;
    setPicked({ uri: out.assets[0].uri });
    reset();
  };

  const pickCamera = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") { setErrorText("Camera access denied"); return; }
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
      {errorText && (
        <ErrorMessage text={errorText} onHide={() => setErrorText(null)} />
      )}
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16, paddingBottom: 24 }}>
        <Text style={{ color: Colors.text, fontSize: 18, fontWeight: "700", marginBottom: 12 }}>Locate Your Star</Text>

        {picked && (
          <SectionCard style={{ marginBottom: 12 }}>
            <Image source={{ uri: picked.uri }} style={{ width: "100%", height: 260, resizeMode: "contain" }} />
          </SectionCard>
        )}

        {result && (
          <SectionCard style={{ gap: 8, marginBottom: 12 }}>
            {result.solved ? (
              <View style={{ backgroundColor: "#064e3b", padding: 10, borderRadius: 8 }}>
                <Text style={{ color: "#a7f3d0", fontWeight: "700" }}>
                  {result.inFrame ? "Target appears in frame" : "Target is outside the frame"}
                </Text>
              </View>
            ) : (
              <View style={{ backgroundColor: "#7f1d1d", padding: 10, borderRadius: 8 }}>
                <Text style={{ color: "#fecaca", fontWeight: "700" }}>Couldnot analyze this photo</Text>
              </View>
            )}

            {result?.target?.name && (
              <Text style={{ color: Colors.text }}>Target: {String(result.target.name)}</Text>
            )}
            <Text style={{ color: Colors.text }}>Solved: {String(result.solved)}</Text>
            {typeof result.inFrame !== "undefined" && (
              <Text style={{ color: Colors.text }}>In Frame: {String(result.inFrame)}</Text>
            )}

            {result.guidance?.hint && (
              <View style={{ backgroundColor: "#1f2937", padding: 10, borderRadius: 8 }}>
                <Text style={{ color: "#bfdbfe", fontSize: 15 }}>Hint: {result.guidance.hint}</Text>
              </View>
            )}

            {result.ai?.short && (
              <Text style={{ color: Colors.text }}>AI: {result.ai.short}</Text>
            )}
            {Array.isArray(result.ai?.steps) && result.ai.steps.length > 0 && (
              <View style={{ gap: 4 }}>
                {result.ai.steps.map((s: string, i: number) => (
                  <Text key={i} style={{ color: Colors.text }}>• {s}</Text>
                ))}
              </View>
            )}

            <View >
         
              {result?.links?.aladin && (
                <PrimaryButton text="Open in Aladin" onPress={() => Linking.openURL(result.links.aladin)} />
              )}
            </View>

          
          </SectionCard>
        )}

        <SectionCard style={{ gap: 10 }}>
          <PrimaryButton text={picked ? "Pick Another Image" : "Pick Sky Image"} onPress={pickImage} />
          <PrimaryButton text="Open Camera" onPress={pickCamera} />
          <PrimaryButton text={analyzeLabel} onPress={analyze} variant={!picked || busy ? "secondary" : "primary"} />
          <PrimaryButton text={pngLabel} onPress={getPng} variant={!picked || busy ? "secondary" : "primary"} />
          {busy && <ActivityIndicator />}
        </SectionCard>

        {pngUri && (
          <SectionCard style={{ marginTop: 12 }}>
            <Image source={{ uri: pngUri }} style={{ width: "100%", height: 300, resizeMode: "contain" }} />
          </SectionCard>
        )}
      </ScrollView>
    </View>
  );
}

