import React from "react";
import { View, TouchableOpacity, Text } from "react-native";
import { styles } from "./ControlsBar.styles";

interface ControlsBarProps {
  onAdjust: (degrees: number) => void;
  onReset: () => void;
}

export default function ControlsBar({ onAdjust, onReset }: ControlsBarProps) {
  return (
    <View style={styles.container}>
      {[-10, -5].map((degrees) => (
        <TouchableOpacity 
          key={degrees} 
          style={styles.button} 
          onPress={() => onAdjust(degrees)}
        >
          <Text style={styles.buttonText}>{degrees}°</Text>
        </TouchableOpacity>
      ))}

      <TouchableOpacity 
        style={[styles.button, styles.resetButton]} 
        onPress={onReset}
      >
        <Text style={styles.buttonText}>Reset</Text>
      </TouchableOpacity>

      {[5, 10].map((degrees) => (
        <TouchableOpacity 
          key={degrees} 
          style={styles.button} 
          onPress={() => onAdjust(degrees)}
        >
          <Text style={styles.buttonText}>+{degrees}°</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

