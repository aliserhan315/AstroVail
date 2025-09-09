import React from "react";
import { View, Text, TextInput, Pressable, ViewStyle } from "react-native";
import styles from "./LabeledInput.styles";

export default function LabeledInput({
  label,
  value,
  onChangeText,
  placeholder,
  multiline,
  rightButtonText,
  onRightButtonPress,
  style,
}: {
  label?: string;
  value: string;
  onChangeText: (t: string) => void;
  placeholder?: string;
  multiline?: boolean;
  rightButtonText?: string;
  onRightButtonPress?: () => void;
  style?: ViewStyle;
}) {
  return (
    <View style={style}>
      {label ? <Text style={styles.label}>{label}</Text> : null}

      <View style={styles.field}>
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="rgba(255,255,255,0.6)"
          style={[styles.input, multiline && styles.inputMultiline]}
          multiline={multiline}
        />

        {rightButtonText ? (
          <View style={styles.rightWrap}>
            <Pressable onPress={onRightButtonPress} style={styles.rightBtn}>
              <Text style={styles.rightBtnText}>{rightButtonText}</Text>
            </Pressable>
          </View>
        ) : null}
      </View>
    </View>
  );
}
