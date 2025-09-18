import React from "react";
import { View, Text } from "react-native";
import { styles } from "./StarHeader.styles";

interface StarHeaderProps {
  title: string;
  constellation: string;
}

export default function StarHeader({ title, constellation }: StarHeaderProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.starEmoji}>🌟</Text>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.constellation}>
        {constellation + " Constellation"}
      </Text>
    </View>
  );
}