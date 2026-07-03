import { apiFetch } from "@/constants/api";
import { Link, useRouter } from "expo-router";
import React, { useState } from "react";
import { Alert, Text, TextInput, TouchableOpacity, View } from "react-native";
import "../../global.css";

export default function SignUpScreen() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSignUp = async () => {
    if (!username || !email || !password) {
      Alert.alert("Missing details", "Please fill in all fields");
      return;
    }

    setLoading(true);
    try {
      const data = await apiFetch("/api/signup", {
        method: "POST",
        body: JSON.stringify({ username, email, password }),
      });

      if (!data.success) {
        Alert.alert("Signup failed", data.message || "Unknown error");
        return;
      }

      Alert.alert("Success", "Account created — please log in.");
      router.replace("/(auth)/login");
    } catch (error) {
      console.error("Signup error:", error);
      Alert.alert("Network error", "Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 justify-center bg-indigo-500 px-5">
      <View className="bg-white rounded-2xl p-6">
        <Text className="text-4xl text-center mb-2">🚀</Text>
        <Text className="text-2xl font-bold text-center">Create Account</Text>
        <Text className="text-gray-500 text-center mb-6">
          Join the smart canteen experience.
        </Text>

        <View className="mb-4">
          <Text className="font-semibold">Username</Text>
          <TextInput
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
            placeholder="Enter your username"
            className="border border-gray-300 rounded-lg px-3 py-2 mt-1"
          />
        </View>

        <View className="mb-4">
          <Text className="font-semibold">Email / Student ID</Text>
          <TextInput
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            placeholder="Enter your college email"
            className="border border-gray-300 rounded-lg px-3 py-2 mt-1"
          />
        </View>

        <View className="mb-4">
          <Text className="font-semibold">Password</Text>
          <TextInput
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            placeholder="Create a strong password"
            className="border border-gray-300 rounded-lg px-3 py-2 mt-1"
          />
        </View>

        <TouchableOpacity
          onPress={handleSignUp}
          disabled={loading}
          className="bg-indigo-600 py-3 rounded-lg items-center mt-2"
        >
          <Text className="text-white font-semibold">
            {loading ? "Creating Account..." : "Sign Up"}
          </Text>
        </TouchableOpacity>

        <View className="flex-row justify-center mt-4">
          <Text className="text-gray-500">Already have an account? </Text>
          <Link href="/(auth)/login" asChild>
            <TouchableOpacity>
              <Text className="text-indigo-600 font-semibold">Login here</Text>
            </TouchableOpacity>
          </Link>
        </View>
      </View>
    </View>
  );
}
