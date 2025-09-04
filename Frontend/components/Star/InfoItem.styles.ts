import { Colors } from "@/constants/Colors";
import { StyleSheet} from "react-native";

export const styles = StyleSheet.create({
  item: {
    width: "48%",
 
    
  },
  label: {
    color: Colors.tint,
    fontSize: 16,
    marginBottom: 6,
    textTransform: "none",
  },
  value: {
    color: Colors.text,
    fontSize: 15,
    fontWeight: "200",
  },
});