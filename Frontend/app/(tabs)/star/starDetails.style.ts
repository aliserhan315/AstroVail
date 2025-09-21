import { StyleSheet } from "react-native";
import { Colors } from "@/constants/Colors";

export const styles = StyleSheet.create({
  fill: { 
    flex: 1 
  },
  center: { 
    justifyContent: "center", 
    alignItems: "center" 
  },
  scrollPad: { 
    paddingHorizontal: 20, 
    gap: 16 
  },
  error: { 
    color: Colors.onPrimary, 
    fontSize: 16, 
    textAlign: "center" 
  },
  errorContainer: {
    padding: 24
  },
  backButton: {
    marginTop: 12
  },
  backButtonContainer: {
    marginBottom: 8
  },
  backButtonText: {
    color: Colors.tint,
    fontSize: 16
  }
});