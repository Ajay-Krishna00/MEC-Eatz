import { apiFetch } from "@/constants/api";
import { useAuth } from "@/context/AuthProvider";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

type Line = {
  item_id: string;
  name: string;
  price: number;
  icon?: string;
  quantity: number;
};

export default function CartScreen() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const { user, refreshUser } = useAuth();

  const [lines, setLines] = useState<Line[]>([]);
  const [placing, setPlacing] = useState(false);

  useEffect(() => {
    if (params.items) {
      try {
        setLines(JSON.parse(params.items as string));
      } catch {
        setLines([]);
      }
    }
  }, [params.items]);

  const setQty = (id: string, delta: number) =>
    setLines((prev) =>
      prev
        .map((l) =>
          l.item_id === id ? { ...l, quantity: l.quantity + delta } : l
        )
        .filter((l) => l.quantity > 0)
    );

  const subtotal = useMemo(
    () => lines.reduce((sum, l) => sum + l.price * l.quantity, 0),
    [lines]
  );
  const tax = subtotal * 0.05;
  const total = subtotal + tax;

  const placeOrder = async () => {
    if (lines.length === 0) return;

    const balance = Number(user?.balance ?? 0);
    if (balance < total) {
      Alert.alert(
        "Insufficient balance",
        `Your wallet has ₹${balance.toFixed(2)} but the order is ₹${total.toFixed(
          2
        )}. Please add money first.`
      );
      return;
    }

    setPlacing(true);
    try {
      const data = await apiFetch("/api/orders", {
        method: "POST",
        body: JSON.stringify({
          items: lines.map((l) => ({ item_id: l.item_id, quantity: l.quantity })),
        }),
      });

      if (!data.success) {
        Alert.alert("Order failed", data.message || "Please try again.");
        return;
      }

      await refreshUser();
      router.replace({
        pathname: "/Cart/pickup",
        params: {
          code: String(data.pickupCode),
          total: String(data.total),
          orderId: String(data.orderId),
        },
      });
    } catch (error) {
      console.error("Order error:", error);
      Alert.alert("Network error", "Please try again.");
    } finally {
      setPlacing(false);
    }
  };

  if (lines.length === 0) {
    return (
      <View className="flex-1 bg-slate-900 justify-center items-center p-6">
        <Text className="text-white text-2xl font-bold mb-4">
          Your cart is empty
        </Text>
        <Text className="text-gray-400 text-center mb-8">
          Add some delicious items from the menu to get started!
        </Text>
        <TouchableOpacity
          className="bg-indigo-600 px-6 py-3 rounded-full"
          onPress={() => router.replace("/(tabs)/home")}
        >
          <Text className="text-white font-semibold text-lg">Browse Menu</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-slate-900 p-6">
      <Text className="text-white text-3xl font-bold mb-1">Your Order 🛒</Text>
      <Text className="text-gray-400 mb-6">
        Wallet balance: ₹{Number(user?.balance ?? 0).toFixed(2)}
      </Text>

      {lines.map((item) => (
        <View
          key={item.item_id}
          className="bg-white/10 rounded-xl p-4 mb-3 flex-row items-center justify-between"
        >
          <View className="flex-row items-center flex-1">
            <Text className="text-3xl mr-4">{item.icon || "🍽️"}</Text>
            <View className="flex-1">
              <Text className="text-white font-semibold text-lg">
                {item.name}
              </Text>
              <Text className="text-indigo-400 font-bold">
                ₹{item.price} × {item.quantity}
              </Text>
            </View>
          </View>

          <View className="flex-row items-center">
            <TouchableOpacity
              onPress={() => setQty(item.item_id, -1)}
              className="bg-white/10 rounded-full w-8 h-8 items-center justify-center border border-white/20"
            >
              <Text className="text-white text-lg">−</Text>
            </TouchableOpacity>
            <Text className="text-white mx-3 font-bold">{item.quantity}</Text>
            <TouchableOpacity
              onPress={() => setQty(item.item_id, 1)}
              className="bg-indigo-600 rounded-full w-8 h-8 items-center justify-center"
            >
              <Text className="text-white text-lg">+</Text>
            </TouchableOpacity>
          </View>
        </View>
      ))}

      <View className="bg-white/10 rounded-xl p-4 mt-4">
        <View className="flex-row justify-between mb-2">
          <Text className="text-gray-300">Subtotal</Text>
          <Text className="text-white font-bold">₹{subtotal.toFixed(2)}</Text>
        </View>
        <View className="flex-row justify-between mb-4">
          <Text className="text-gray-300">Tax (5%)</Text>
          <Text className="text-white font-bold">₹{tax.toFixed(2)}</Text>
        </View>
        <View className="flex-row justify-between border-t border-white/20 pt-2">
          <Text className="text-white text-lg font-bold">Total</Text>
          <Text className="text-green-400 text-lg font-bold">
            ₹{total.toFixed(2)}
          </Text>
        </View>
      </View>

      <TouchableOpacity
        disabled={placing}
        className="bg-green-500 rounded-xl p-4 mt-6 items-center"
        onPress={placeOrder}
      >
        <Text className="text-white font-bold text-lg">
          {placing ? "Placing order..." : `Pay ₹${total.toFixed(2)} from Wallet`}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        className="bg-indigo-600 rounded-xl p-4 mt-3 mb-10 items-center"
        onPress={() => router.replace("/(tabs)/home")}
      >
        <Text className="text-white font-bold text-lg">Add More Items</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
