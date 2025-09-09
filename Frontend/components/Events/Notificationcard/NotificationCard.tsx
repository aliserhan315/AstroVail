import React from "react";
import { View, Text } from "react-native";
import { styles } from "./NotificationCard.style";


export type NotiItem = {
  _id: string;
  title: string;
  body?: string;
  createdAt?: string;
  readAt?: string | null;
  event?: { title?: string; startTime?: string };
  star?: { displayName?: string; baseName?: string };
};

export default function NotificationCard({
  noti,
  rightLabel,
}: {
  noti: NotiItem;
  rightLabel: string;
}) {
  const isUnread = !noti.readAt;

  return (
    <View style={styles.card}>
      <View style={styles.rowTop}>
        <Text style={styles.title} numberOfLines={1}>
          {isUnread ? "🔔 " : " "}
          {noti.title}
        </Text>
        <Text style={styles.rightLabel} numberOfLines={1}>{rightLabel}</Text>
      </View>
      {!!noti.body && (
        <Text style={styles.body} numberOfLines={2}>
          {noti.body}
        </Text>
      )}
    </View>
  );
}