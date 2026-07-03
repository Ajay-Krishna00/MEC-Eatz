import { apiFetch } from "@/constants/api";
import { useAuth } from "@/context/AuthProvider";
import { Link } from "expo-router";
import React, { useState } from "react";
import { Alert, Text, TextInput, TouchableOpacity, View } from "react-native";
import "../../global.css";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Missing details", "Please enter both email and password");
      return;
    }

    setLoading(true);
    try {
      const data = await apiFetch("/api/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });

      if (!data.success) {
        Alert.alert("Login failed", data.message || "Unknown error");
        return;
      }

      await login(data.user, data.token);
    } catch (error) {
      console.error("Login error:", error);
      Alert.alert("Network error", "Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 justify-center bg-indigo-500 px-5">
      <View className="bg-white rounded-2xl p-6">
        <Text className="text-4xl text-center mb-2">🍽️</Text>
        <Text className="text-2xl font-bold text-center">
          Login to MEC Eatz
        </Text>
        <Text className="text-gray-500 text-center mb-6">Welcome back!</Text>

        <View className="mb-4">
          <Text className="font-semibold">Email / Student ID</Text>
          <TextInput
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            placeholder="Enter your email"
            className="border border-gray-300 rounded-lg px-3 py-2 mt-1"
          />
        </View>

        <View className="mb-4">
          <Text className="font-semibold">Password</Text>
          <TextInput
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            placeholder="Enter password"
            className="border border-gray-300 rounded-lg px-3 py-2 mt-1"
          />
        </View>

        <TouchableOpacity
          onPress={handleLogin}
          disabled={loading}
          className="bg-indigo-600 py-3 rounded-lg items-center mt-2"
        >
          <Text className="text-white font-semibold">
            {loading ? "Logging in..." : "Login"}
          </Text>
        </TouchableOpacity>

        <View className="flex-row justify-center mt-4">
          <Text className="text-gray-500">New student? </Text>
          <Link href="/(auth)/signup" asChild>
            <TouchableOpacity>
              <Text className="text-indigo-600 font-semibold">
                Register here
              </Text>
            </TouchableOpacity>
          </Link>
        </View>
      </View>
    </View>
  );
}
