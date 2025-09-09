/* eslint-disable react-hooks/exhaustive-deps */
import React from "react";
import {
  View, Text, useWindowDimensions, PanResponder,
  GestureResponderEvent, PanResponderGestureState, ScrollView,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import styles from "./SkyPanel.styles";
import { COLORS } from "../theme/Colors";

export type StarLite = { id: string; name: string };

function Pill({ icon, label }: { icon: keyof typeof Ionicons.glyphMap; label: string }) {
  return (
    <View style={styles.pill}>
      <Ionicons name={icon} size={13} color={COLORS.pillText} />
      <Text style={styles.pillText}>{label}</Text>
    </View>
  );
}

type Props = {
  stars?: StarLite[];
  onReposition?: (positions: Record<string, { x: number; y: number }>) => void;
};

export default function SkyPanel({ stars = [], onReposition }: Props) {
  const { width: winW } = useWindowDimensions();
  const [canvasW, setCanvasW] = React.useState(winW - 40);
  const [canvasH, setCanvasH] = React.useState(220);

  const DOT = 10;

  const [positions, setPositions] = React.useState<Record<string, { x: number; y: number }>>({});
  const positionsRef = React.useRef(positions);
  React.useEffect(() => { positionsRef.current = positions; }, [positions]);

  const clamp = React.useCallback(
    (val: number, min: number, max: number) => Math.max(min, Math.min(max, val)),
    []
  );

  React.useEffect(() => {
    if (!canvasW || !canvasH) return;
    const pad = 16;
    const maxX = Math.max(0, canvasW - DOT - pad);
    const maxY = Math.max(0, canvasH - DOT - pad - 44);
    setPositions(prev => {
      const next = { ...prev };
      stars.forEach((s, i) => {
        if (!next[s.id]) {
          const fx = ((i * 97) % Math.max(1, maxX - pad)) + pad;
          const fy = ((i * 61) % Math.max(1, maxY - pad)) + pad;
          next[s.id] = { x: fx, y: fy };
        }
      });
      Object.keys(next).forEach(id => { if (!stars.find(s => s.id === id)) delete next[id]; });
      return next;
    });
  }, [canvasW, canvasH, stars.map(s => s.id).join("|")]);

  const panRefs = React.useRef<Record<string, any>>({});

  function makePanResponder(id: string) {
    if (panRefs.current[id]) return panRefs.current[id];

    let startX = 0;
    let startY = 0;

    panRefs.current[id] = PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        const p = positionsRef.current[id];
        startX = p?.x ?? 0;
        startY = p?.y ?? 0;
      },
      onPanResponderMove: (_evt: GestureResponderEvent, g: PanResponderGestureState) => {
        const nx = clamp(startX + g.dx, 0, Math.max(0, canvasW - DOT));
        const ny = clamp(startY + g.dy, 0, Math.max(0, canvasH - DOT));
        setPositions(prev => ({ ...prev, [id]: { x: nx, y: ny } }));
      },
      onPanResponderRelease: () => {
        const latest = positionsRef.current; 
        onReposition?.(latest);
      },
    });

    return panRefs.current[id];
  }

  return (
    <View style={styles.card}>
      <LinearGradient
        colors={["rgba(88,112,255,0.18)", "rgba(23,34,64,0.75)"]}
        start={{ x: 0.2, y: 0 }}
        end={{ x: 0.8, y: 1 }}
        style={styles.fill}
        onLayout={(e) => {
          setCanvasW(e.nativeEvent.layout.width);
          setCanvasH(e.nativeEvent.layout.height);
        }}
      />

      <View style={styles.countBadge}>
        <Text style={styles.countText}>
          {stars.length} {stars.length === 1 ? "Star" : "Stars"}
        </Text>
      </View>

      {stars.map((s) => {
        const pos = positions[s.id] ?? { x: 20, y: 20 };
        const pan = makePanResponder(s.id);
        return <View key={s.id} {...pan.panHandlers} style={[styles.dot, { left: pos.x, top: pos.y }]} />;
      })}

      <View style={styles.toolbar}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.toolbarRow}>
          <Pill icon="star-outline" label="Your Collection" />
          <Pill icon="move-outline" label="Drag to arrange" />
        
        </ScrollView>
      </View>
    </View>
  );
}
