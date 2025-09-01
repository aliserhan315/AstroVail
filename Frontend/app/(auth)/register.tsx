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

export default function Register() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [first, setFirst] = useState("");
  const [last, setLast] = useState("");
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setLoading(true);
    try {
      router.replace({ pathname: "/(auth)/login" });
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
          <Text style={styles.title}>Sign Up to AstroVail</Text>

          <View style={styles.subRow}>
            <Text style={styles.hint}>Already have an account?</Text>
            <Link href={{ pathname: "/(auth)/login" }} asChild>
              <TouchableOpacity><Text style={styles.link}>Sign In</Text></TouchableOpacity>
            </Link>
          </View>

          <View style={styles.form}>

            <View style={styles.row}>
              <View style={[styles.inputWrap, { flex: 1 }]}>
                <Text style={styles.inputLabel}>First Name</Text>
                <TextInput
                  placeholder="First Name"
                  placeholderTextColor="rgba(255,255,255,0.6)"
                  autoCapitalize="words"
                  value={first}
                  onChangeText={setFirst}
                  style={styles.input}
                />
              </View>

              <View style={[styles.inputWrap, { flex: 1 }]}>
                <Text style={styles.inputLabel}>Last Name</Text>
                <TextInput
                  placeholder="Last Name"
                  placeholderTextColor="rgba(255,255,255,0.6)"
                  autoCapitalize="words"
                  value={last}
                  onChangeText={setLast}
                  style={styles.input}
                />
              </View>
            </View>

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

            <TouchableOpacity disabled={loading} onPress={submit} style={styles.primaryBtn} activeOpacity={0.9}>
              <Text style={styles.primaryText}>{loading ? "Registering…" : "Register"}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}
