import { apiFetch } from "@/constants/api";
import { useAuth } from "@/context/AuthProvider";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Linking,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import "../../global.css";

// Canteen's collection UPI ID (money is added to the student's prepaid wallet).
const CANTEEN_UPI_ID = "meceatz@okhdfcbank";
const QUICK_AMOUNTS = [50, 100, 200, 500];

const AddMoneyScreen = () => {
  const { user, refreshUser } = useAuth();
  const router = useRouter();
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);

  // Credit the wallet through the backend (records a ledger entry atomically).
  const creditWallet = async (value: number) => {
    setLoading(true);
    try {
      const data = await apiFetch("/api/wallet/topup", {
        method: "POST",
        body: JSON.stringify({ amount: value }),
      });

      if (!data.success) {
        Alert.alert("Top-up failed", data.message || "Please try again.");
        return;
      }

      await refreshUser();
      Alert.alert("Wallet updated", `₹${value.toFixed(2)} added to your wallet.`);
      router.replace("/(tabs)/home");
    } catch (error) {
      console.error("Top-up error:", error);
      Alert.alert("Network error", "Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleAddMoney = async () => {
    const value = Number(amount);
    if (!Number.isFinite(value) || value <= 0) {
      Alert.alert("Invalid amount", "Please enter a valid amount.");
      return;
    }

    const upiUrl = `upi://pay?pa=${CANTEEN_UPI_ID}&pn=${encodeURIComponent(
      "MEC Eatz"
    )}&am=${value}&tn=${encodeURIComponent("Wallet top-up")}&cu=INR`;

    try {
      const supported = await Linking.canOpenURL(upiUrl);
      if (supported) {
        await Linking.openURL(upiUrl);
        // UPI apps don't reliably return a status to the app, so confirm manually.
        Alert.alert("Payment", "Did the UPI payment succeed?", [
          { text: "No", style: "cancel" },
          { text: "Yes", onPress: () => creditWallet(value) },
        ]);
      } else {
        // No UPI app (e.g. emulator) — allow crediting the wallet directly for demos.
        Alert.alert(
          "No UPI app found",
          "Add this amount to your wallet directly?",
          [
            { text: "Cancel", style: "cancel" },
            { text: "Add", onPress: () => creditWallet(value) },
          ]
        );
      }
    } catch (error) {
      Alert.alert(
        "Error",
        "Failed to open UPI app: " +
          (error instanceof Error ? error.message : "Unknown error")
      );
    }
  };

  return (
    <ScrollView className="flex-1 bg-slate-900 px-6">
      <View className="bg-white/10 border border-white/20 rounded-2xl p-6 shadow-lg mt-20">
        <Text className="text-white text-lg font-semibold mb-1 text-center">
          Add Money to Wallet
        </Text>
        <Text className="text-indigo-300 text-center mb-6">
          Balance: ₹{Number(user?.balance ?? 0).toFixed(2)}
        </Text>

        <View className="flex-row flex-wrap justify-between mb-4">
          {QUICK_AMOUNTS.map((a) => (
            <TouchableOpacity
              key={a}
              onPress={() => setAmount(String(a))}
              className="w-[23%] bg-white/10 border border-white/20 rounded-xl py-3 items-center mb-2"
            >
              <Text className="text-white font-semibold">₹{a}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View className="mb-6">
          <Text className="text-indigo-300 mb-2 font-medium">Amount (INR)</Text>
          <TextInput
            className="bg-white/15 text-white rounded-xl p-4 text-base border border-white/20"
            placeholder="Enter amount"
            placeholderTextColor="#9ca3af"
            value={amount}
            onChangeText={setAmount}
            keyboardType="numeric"
          />
        </View>

        <TouchableOpacity onPress={handleAddMoney} disabled={loading} activeOpacity={0.9}>
          <LinearGradient
            colors={["#6366f1", "#4f46e5"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            className="rounded-xl py-4 items-center shadow-lg"
          >
            <Text className="text-white text-xl font-semibold tracking-wide">
              {loading ? "Processing..." : `Add ₹${amount || "0"} via UPI`}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>

      <View className="mt-8 items-center">
        <Text className="text-indigo-300 text-sm text-center leading-5">
          Your UPI app opens for payment. Once it succeeds, the amount is added
          to your prepaid wallet.
        </Text>
      </View>
    </ScrollView>
  );
};

export default AddMoneyScreen;
