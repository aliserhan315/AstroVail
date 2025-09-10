import React, { useEffect } from "react";
import { View, Text, Linking } from "react-native";
import { CheckoutAPI } from "@/lib/endpoint";

export default function CheckoutScreen() {
  useEffect(() => {
    (async () => {
      try {
        const { checkoutUrl } = await CheckoutAPI.create();
        if (checkoutUrl) {
          Linking.openURL(checkoutUrl);
        }
      } catch (e) {
        console.log("checkout create error", e);
      }
    })();
  }, []);

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#000" }}>
      <Text style={{ color: "#fff" }}>Redirecting to payment...</Text>
    </View>
  );
}

