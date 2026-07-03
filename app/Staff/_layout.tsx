import { Stack } from "expo-router";
import React from "react";
import "../../global.css";

export default function StaffLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="dashboard" />
    </Stack>
  );
}
