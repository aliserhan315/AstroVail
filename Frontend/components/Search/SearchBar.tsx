import React, { useRef } from "react";
import { View, TextInput, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import styles from "./SearchBar.styles";

type Props = {
  value: string;
  onChange: (t: string) => void;
  onClear: () => void;
  autoFocus?: boolean;
  onSubmit?: (t: string) => void; 
};

export default function SearchBar({ value, onChange, onClear, autoFocus, onSubmit }: Props) {
  const ref = useRef<TextInput>(null);

  return (
    <View style={styles.wrap}>
      <Ionicons name="search" size={18} color="rgba(255,255,255,0.85)" style={styles.icon} />
      <TextInput
        ref={ref}
        value={value}
        onChangeText={onChange}
        placeholder="Search stars or constellations"
        placeholderTextColor="rgba(255,255,255,0.6)"
        autoFocus={autoFocus}
        style={styles.input}
        returnKeyType="search"
        autoCapitalize="none"
        autoCorrect={false}
        onSubmitEditing={() => onSubmit?.(value)}
        accessibilityLabel="Search input"
      />
      {value.length > 0 && (
        <TouchableOpacity
          onPress={() => {
            onClear();
            ref.current?.focus();
          }}
          style={styles.clearBtn}
          hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}
          accessibilityRole="button"
          accessibilityLabel="Clear search"
        >
          <Ionicons name="close-circle" size={18} color="rgba(255,255,255,0.85)" />
        </TouchableOpacity>
      )}
    </View>
  );
}
