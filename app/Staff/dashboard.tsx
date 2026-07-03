import { apiFetch } from "@/constants/api";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import "../../global.css";

type TopItem = { name: string; quantity: number; revenue: number };
type Analytics = {
  total_revenue: number;
  total_orders: number;
  today_revenue: number;
  top_items: TopItem[];
};

export default function StaffDashboard() {
  const router = useRouter();
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [code, setCode] = useState("");
  const [verifying, setVerifying] = useState(false);

  const loadAnalytics = useCallback(async () => {
    try {
      const data = await apiFetch("/api/staff/analytics");
      if (data.success) setAnalytics(data.analytics);
      else Alert.alert("Error", data.message || "Could not load analytics");
    } catch (err) {
      console.error("Analytics error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAnalytics();
  }, [loadAnalytics]);

  const verifyPickup = async () => {
    const value = code.trim();
    if (!value) {
      Alert.alert("Enter code", "Enter the 6-digit pickup code.");
      return;
    }
    setVerifying(true);
    try {
      const data = await apiFetch("/api/staff/verify-pickup", {
        method: "POST",
        body: JSON.stringify({ pickupCode: value }),
      });
      if (data.success) {
        Alert.alert(
          "✅ Verified",
          `Order confirmed — ₹${Number(data.order.total).toFixed(2)}. Hand it over!`
        );
        setCode("");
        loadAnalytics();
      } else {
        Alert.alert("❌ Not valid", data.message || "Invalid pickup code");
      }
    } catch (err) {
      console.error("Verify error:", err);
      Alert.alert("Network error", "Please try again.");
    } finally {
      setVerifying(false);
    }
  };

  const Stat = ({ label, value }: { label: string; value: string }) => (
    <View className="bg-white/10 border border-white/20 rounded-2xl p-4 flex-1 mx-1">
      <Text className="text-indigo-300 text-xs font-medium">{label}</Text>
      <Text className="text-white text-2xl font-extrabold mt-1">{value}</Text>
    </View>
  );

  return (
    <ScrollView
      className="flex-1 bg-slate-900 px-5"
      refreshControl={
        <RefreshControl refreshing={loading} onRefresh={loadAnalytics} tintColor="#fff" />
      }
    >
      <Text className="text-white text-3xl font-bold mt-14 mb-1">
        Canteen Dashboard
      </Text>
      <Text className="text-gray-400 mb-6">Real-time sales & order pickup</Text>

      {/* Pickup verification */}
      <View className="bg-white/10 border border-white/20 rounded-2xl p-5 mb-6">
        <Text className="text-white font-semibold text-lg mb-3">
          Verify Order Pickup 🔎
        </Text>
        <TextInput
          className="bg-white/15 text-white rounded-xl p-4 text-lg tracking-[6px] text-center border border-white/20"
          placeholder="000000"
          placeholderTextColor="#64748b"
          keyboardType="number-pad"
          maxLength={6}
          value={code}
          onChangeText={setCode}
        />
        <TouchableOpacity
          onPress={verifyPickup}
          disabled={verifying}
          className="bg-green-500 rounded-xl py-3 items-center mt-3"
        >
          <Text className="text-white font-bold text-lg">
            {verifying ? "Verifying..." : "Verify & Complete"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Analytics */}
      <Text className="text-white text-xl font-bold mb-3">Sales Overview 📊</Text>
      {loading && !analytics ? (
        <ActivityIndicator size="large" color="#4F46E5" className="my-6" />
      ) : analytics ? (
        <>
          <View className="flex-row mb-3">
            <Stat
              label="Total Revenue"
              value={`₹${Number(analytics.total_revenue).toFixed(0)}`}
            />
            <Stat label="Total Orders" value={String(analytics.total_orders)} />
          </View>
          <View className="flex-row mb-6">
            <Stat
              label="Today's Revenue"
              value={`₹${Number(analytics.today_revenue).toFixed(0)}`}
            />
            <Stat
              label="Top Item"
              value={analytics.top_items?.[0]?.name?.split(" ")[0] || "—"}
            />
          </View>

          <Text className="text-white text-lg font-bold mb-3">
            Top Sellers 🏆
          </Text>
          <View className="bg-white/10 border border-white/20 rounded-2xl p-4 mb-10">
            {analytics.top_items.length === 0 ? (
              <Text className="text-gray-400">No sales yet.</Text>
            ) : (
              analytics.top_items.map((it, i) => (
                <View
                  key={it.name}
                  className={`flex-row justify-between py-3 ${
                    i < analytics.top_items.length - 1
                      ? "border-b border-white/10"
                      : ""
                  }`}
                >
                  <Text className="text-white font-medium">
                    {i + 1}. {it.name}
                  </Text>
                  <Text className="text-indigo-300">
                    {it.quantity} sold · ₹{Number(it.revenue).toFixed(0)}
                  </Text>
                </View>
              ))
            )}
          </View>
        </>
      ) : (
        <Text className="text-gray-400 mb-10">No analytics available.</Text>
      )}

      <TouchableOpacity
        className="bg-indigo-600 rounded-xl py-4 items-center mb-16"
        onPress={() => router.replace("/(tabs)/home")}
      >
        <Text className="text-white font-bold text-lg">Back to App</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
