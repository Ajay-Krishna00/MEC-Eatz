// app/upi/_layout.tsx
import React from "react";
import { Stack } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { View, Text } from "react-native";
import "../../global.css";

export default function UPILayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="cart" />
      <Stack.Screen name="pickup" />
    </Stack>
  );
}
