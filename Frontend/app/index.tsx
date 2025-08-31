import React, { useEffect, useState } from "react";
import { View, ActivityIndicator, StyleSheet, Text } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";


export default function IndexGate() {
const router = useRouter();
const [booting, setBooting] = useState(true);


useEffect(() => {
(async () => {
try {
const seen = await AsyncStorage.getItem("av_seen_onboarding");
if (seen === "true") {
router.replace("/(tabs)");
} else {
router.replace("/(oboarding)");
}
} finally {
setBooting(false);
}
})();
}, [router]);


return (
<View style={styles.center}>
<ActivityIndicator size="large" />
<Text style={styles.bootText}>Launching AstroVail…</Text>
</View>
);
}


const styles = StyleSheet.create({
center: { flex: 1, backgroundColor: "#0B0F1A", alignItems: "center", justifyContent: "center" },
bootText: { color: "#FFFFFF", marginTop: 8 },
});