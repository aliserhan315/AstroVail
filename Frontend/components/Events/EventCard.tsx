import React from "react";
import { View, Text, Pressable, ActivityIndicator } from "react-native";
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
  dateLabel,
  onRemind,
  reminded = false,
  saving = false,
}: {
  event: EventItem;
  dateLabel: string;
  onRemind?: (id: string) => void;
  reminded?: boolean;
  saving?: boolean;
}) {
  return (
    <View style={styles.card}>
      <View style={styles.rowTop}>
        <Text style={styles.title} numberOfLines={1}>
          🌠 {event.title}
        </Text>

        {reminded ? (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>✓ Reminder set</Text>
          </View>
        ) : (
          <Pressable
            disabled={saving}
            onPress={() => onRemind?.(event._id)}
            style={[styles.reminderBtn, saving && styles.reminderBtnDisabled]}
          >
            {saving ? (
              <View style={styles.rowInline}>
                <ActivityIndicator size="small" color="#FFFFFF" />
                <Text style={styles.reminderText}>  Setting…</Text>
              </View>
            ) : (
              <Text style={styles.reminderText}>Set Reminder</Text>
            )}
          </Pressable>
        )}
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
