import React from "react";
import { View, Text } from "react-native";
import SectionCard from "@/components/ui/SectionCard";
import PrimaryButton from "@/components/ui/PrimaryButton";
import { Colors } from "@/constants/Colors";
import type { StarDetectionResult } from "@/types/overlay";

interface Props {
  result: StarDetectionResult;
  onOpenFinder?: () => void;
}

export default function AnalysisResultCard({ result, onOpenFinder }: Props) {
  return (
    <SectionCard style={{ gap: 6 }}>
      <Text style={{ color: Colors.text }}>Star Found: {String(result.starFound)}</Text>
      <Text style={{ color: Colors.text }}>Image Analyzed: {String(result.imageAnalyzed)}</Text>

      {!!result.ai?.message && (
        <Text style={{ color: Colors.tint }}>AI: {result.ai.message}</Text>
      )}

      {!!result.ai?.tips?.length && (
        <View>
          {result.ai.tips!.map((tip, i) => (
            <Text key={i} style={{ color: Colors.text }}>• {tip}</Text>
          ))}
        </View>
      )}

      {!!result.ai?.context && (
        <Text style={{ color: Colors.text, fontStyle: "italic" }}>ℹ️ {result.ai.context}</Text>
      )}

      {!result.starFound && onOpenFinder && (
        <PrimaryButton text="Open Live Finder" onPress={onOpenFinder} />)
      }
    </SectionCard>
  );
}