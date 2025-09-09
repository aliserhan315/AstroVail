import React from "react";
import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

const tabBg = "#0B0F1A";
const active = "#B4CDED";

function IconWrap({
  focused,
  name,
  color,
}: {
  focused: boolean;
  name:
    | keyof typeof Ionicons.glyphMap;
  color: string;
}) {
  return (
    <div
      style={{
        padding: focused ? 8 : 0,
        borderRadius: 999,
        backgroundColor: focused ? "rgba(33, 121, 255, 0.18)" : "transparent",
      }}
    >
      <Ionicons name={name as any} size={22} color={color} />
    </div>
  );
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarActiveTintColor: active,
        tabBarStyle: {
          backgroundColor: tabBg,
          borderTopColor: "transparent",
          height: 64,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <IconWrap focused={focused} name={focused ? "home" : "home-outline"} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="stars"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <IconWrap focused={focused} name={focused ? "search" : "search-outline"} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="events"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <IconWrap focused={focused} name={focused ? "map" : "map-outline"} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="gift"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <IconWrap focused={focused} name={focused ? "gift" : "gift-outline"} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <IconWrap focused={focused} name={focused ? "person" : "person-outline"} color={color} />
          ),
        }}
      />
      <Tabs.Screen name="(star)" options={{ href: null }} />
    </Tabs>
  );
}
