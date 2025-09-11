import React, { useState } from "react";
import { View,Text,TouchableOpacity,KeyboardAvoidingView,Platform,StatusBar,TextInput, Image,} from "react-native";
import { useRouter, Link } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Background from "@/components/Background";
import Button from "@/components/ui/Button";
import { ButtonVariant } from "@/types/ui";
import styles from "./authStyles";
import { AuthAPI } from "@/lib/endpoint";
import { useAppDispatch } from "@/state/hooks";
import { setCredentials } from "@/state/slices/authSlice";

const LOGO = require("../../assets/images/AstroVailLogo.png");
const ONBOARDING_KEY = "av_seen_onboarding";

export default function Login() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const dispatch = useAppDispatch();

  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const submit = async () => {
    if (loading) return;
    setLoading(true);
    setErr(null);
    try {
      const out = await AuthAPI.login({ email, password: pw });
      dispatch(
        setCredentials({
          user: out.user,
          accessToken: out.accessToken,
          refreshToken: out.refreshToken,
        })
      );
      await AsyncStorage.setItem(ONBOARDING_KEY, "true");
      router.replace("/(tabs)");
    } catch (e: any) {
      setErr(e?.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.root}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      <Background />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <View style={[styles.centerWrap, { paddingBottom: insets.bottom + 12 }]}>
          <Image source={LOGO} style={styles.logo} />
          <Text style={styles.title}>Sign in to your{"\n"}Account</Text>

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

            {err ? <Text style={{ color: "#FCA5A5", marginTop: 8 }}>{err}</Text> : null}

            <TouchableOpacity style={styles.smallLink}>
              <Text style={styles.smallLinkText}>Forgot Your Password ?</Text>
            </TouchableOpacity>

            <View style={styles.subRow}>
              <Text style={styles.hint}>Don’t have an account?</Text>
              <Link href={{ pathname: "/(auth)/register" }} asChild>
                <TouchableOpacity>
                  <Text style={styles.link}>Sign Up</Text>
                </TouchableOpacity>
              </Link>
            </View>

            <Button
              title={loading ? "Logging in�?�" : "Log In"}
              onPress={submit}
              loading={loading}
              variant={ButtonVariant.Primary}
              style={styles.primaryBtn}
            />
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

