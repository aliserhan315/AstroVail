import React, { useState } from "react";
import {
  View, Text, ImageBackground, TouchableOpacity,
  KeyboardAvoidingView, Platform, StatusBar, TextInput, Image,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter, Link } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import styles, { COLORS } from "./authStyles";

const BG = require("../../assets/images/Bg.png");
const LOGO = require("../../assets/images/AstroVailLogo.png");

export default function Login() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setLoading(true);
    try {
      router.replace({ pathname: "/(tabs)" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.root}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      <ImageBackground source={BG} resizeMode="cover" style={styles.bg}>
        <LinearGradient
          colors={[COLORS.overlayTop, COLORS.overlayBottom]}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          style={styles.overlay}
        />
      </ImageBackground>

      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
        <View style={[styles.centerWrap, { paddingBottom: insets.bottom + 12 }]}>

          <Image source={LOGO} style={styles.logo} /> 

          <Text style={styles.title}>Sign in to your{"\n"}Account</Text>

          <View style={styles.subRow}>
            <Text style={styles.hint}>Don’t have an account?</Text>
            <Link href={{ pathname: "/(auth)/register" }} asChild>
              <TouchableOpacity><Text style={styles.link}>Sign Up</Text></TouchableOpacity>
            </Link>
          </View>

          {/* Form */}
          <View style={styles.form}>
            <View style={styles.inputWrap}>
              <Text style={styles.inputLabel}>Email</Text>
              <TextInput
                placeholder="Example@email.com"
                placeholderTextColor="rgba(255,255,255,0.6)"
                autoCapitalize="none"
                keyboardType="email-address"
                value={email}
                onChangeText={setEmail}
                style={styles.input}
              />
            </View>

            <View style={styles.inputWrap}>
              <Text style={styles.inputLabel}>Password</Text>
              <TextInput
                placeholder="********"
                placeholderTextColor="rgba(255,255,255,0.6)"
                secureTextEntry
                value={pw}
                onChangeText={setPw}
                style={styles.input}
              />
            </View>

            <TouchableOpacity style={styles.smallLink}>
              <Text style={styles.smallLinkText}>Forgot Your Password ?</Text>
            </TouchableOpacity>

            <TouchableOpacity disabled={loading} onPress={submit} style={styles.primaryBtn} activeOpacity={0.9}>
              <Text style={styles.primaryText}>{loading ? "Logging in…" : "Log In"}</Text>
            </TouchableOpacity>

            {/* 
            <TouchableOpacity style={styles.googleBtn} activeOpacity={0.9}>
              <Text style={styles.googleText}>Sign in with Google</Text>
            </TouchableOpacity>
            */}
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}
