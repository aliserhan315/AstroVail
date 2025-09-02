import React from "react";
import { ImageBackground, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { COLORS } from "./theme/Colors";

const BG = require("../assets/images/Bg.png"); 

export default function Background() {
  return (
    <ImageBackground source={BG} resizeMode="cover" style={StyleSheet.absoluteFillObject}>
      <LinearGradient
        colors={[COLORS.overlayTop, COLORS.overlayBottom]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={StyleSheet.absoluteFillObject}
      />
    </ImageBackground>
  );
}
