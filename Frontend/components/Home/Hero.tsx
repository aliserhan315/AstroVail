import React from "react";
import { View, Text } from "react-native";
import styles from "./Hero.styles";

export default function Hero({ name }: { name: string }) {
  return (
    <View style={styles.hero}>
      <Text style={styles.h1}>Welcome back, {name}</Text>
      <Text style={styles.hint}>Explore the universe today</Text>
    </View>
  );
}
