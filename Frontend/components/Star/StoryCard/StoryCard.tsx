import React from "react";
import { Text, View } from "react-native";
import SectionCard from "@/components/ui/SectionCard";
import { styles } from "./StoryCard.style";

export default function StoryCard({ title, body, footer }: { title: string; body: string; footer?: React.ReactNode }) {
  return (
    <SectionCard>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.body}>{body}</Text>
      {footer ? <View style={{ marginTop: 12, gap: 10 }}>{footer}</View> : null}
    </SectionCard>
  );
}


