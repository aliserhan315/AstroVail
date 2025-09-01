import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from "react-native";

type Props = {
  label: string;
  value: string;
  onChangeText: (t: string) => void;
  placeholder?: string;
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
  keyboardType?: "default" | "email-address";
  secureTextEntry?: boolean;
  error?: string;
};

export default function TextField({
  label,
  value,
  onChangeText,
  placeholder,
  autoCapitalize = "none",
  keyboardType = "default",
  secureTextEntry,
  error,
}: Props) {
  const [hidden, setHidden] = useState(!!secureTextEntry);

  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>{label}</Text>
      <View style={[styles.inputRow, error && styles.inputRowError]}>
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="rgba(255,255,255,0.6)"
          autoCapitalize={autoCapitalize}
          keyboardType={keyboardType}
          secureTextEntry={hidden}
          style={styles.input}
        />
        {secureTextEntry && (
          <TouchableOpacity onPress={() => setHidden(!hidden)} hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}>
            <Text style={styles.toggle}>{hidden ? "Show" : "Hide"}</Text>
          </TouchableOpacity>
        )}
      </View>
      {!!error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { width: "100%", marginBottom: 14 },
  label: { color: "#FFFFFF", fontWeight: "700", marginBottom: 8 },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: "transparent",
  },
  inputRowError: { borderColor: "#ef4444" },
  input: { flex: 1, color: "#FFFFFF", fontSize: 16, paddingRight: 8 },
  toggle: { color: "#FFFFFF", fontWeight: "700" },
  error: { color: "#fecaca", marginTop: 6, fontSize: 12 },
});
