import React from "react";
import { View, Text, Pressable } from "react-native";
import { styles } from "./EventCard.style";

export type EventItem = {
  _id: string;
  title: string;
  startTime?: string;
  endTime?: string;
  description?: string;
};

export default function EventCard({
  event,
  onRemind,
  dateLabel,
}: {
  event: EventItem;
  onRemind?: (id: string) => void;
  dateLabel: string; 
}) {
  return (
    <View style={styles.card}>
      <View style={styles.rowTop}>
        <Text style={styles.title} numberOfLines={1}>🌠 {event.title}</Text>
        <Pressable onPress={() => onRemind?.(event._id)} style={styles.reminderBtn}>
          <Text style={styles.reminderText}>Set Reminder</Text>
        </Pressable>
      </View>

      <Text style={styles.date}>{dateLabel}</Text>
      {!!event.description && (
        <Text style={styles.desc} numberOfLines={2}>
          {event.description}
        </Text>
      )}
    </View>
  );
}
