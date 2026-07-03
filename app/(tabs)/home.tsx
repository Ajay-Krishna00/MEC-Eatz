import { apiFetch } from "@/constants/api";
import { useAuth } from "@/context/AuthProvider";
import { LinearGradient } from "expo-linear-gradient";
import { Link, useFocusEffect } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import "../../global.css";

type Item = {
  id: string;
  name: string;
  price: number;
  available: boolean;
  description?: string;
};

// A tiny emoji picker so the menu still feels lively without image assets.
const emojiFor = (name: string) => {
  const n = name.toLowerCase();
  if (n.includes("pizza")) return "🍕";
  if (n.includes("burger")) return "🍔";
  if (n.includes("coffee")) return "☕";
  if (n.includes("tea")) return "🧋";
  if (n.includes("salad")) return "🥗";
  if (n.includes("sandwich")) return "🥪";
  if (n.includes("wrap")) return "🌯";
  if (n.includes("pasta")) return "🍝";
  if (n.includes("smoothie") || n.includes("shake")) return "🥤";
  if (n.includes("biriyani") || n.includes("biryani") || n.includes("rice"))
    return "🍛";
  return "🍽️";
};

export default function StudentScreen() {
  const { user, refreshUser } = useAuth();
  const [items, setItems] = useState<Item[]>([]);
  const [cart, setCart] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  const username = user?.name || user?.email || "Guest";

  // Refresh menu + wallet balance every time the tab gains focus.
  useFocusEffect(
    useCallback(() => {
      let active = true;
      (async () => {
        try {
          const data = await apiFetch("/api/items");
          if (active && data.success) setItems(data.items);
        } catch (err) {
          console.error("Load items failed:", err);
        } finally {
          if (active) setLoading(false);
        }
      })();
      refreshUser();
      return () => {
        active = false;
      };
    }, [refreshUser])
  );

  const addToCart = (id: string) =>
    setCart((c) => ({ ...c, [id]: (c[id] || 0) + 1 }));

  const removeFromCart = (id: string) =>
    setCart((c) => {
      const next = { ...c };
      if (next[id] > 1) next[id] -= 1;
      else delete next[id];
      return next;
    });

  // Build the payload the cart/order endpoint expects.
  const cartLines = items
    .filter((it) => cart[it.id] > 0)
    .map((it) => ({
      item_id: it.id,
      name: it.name,
      price: it.price,
      icon: emojiFor(it.name),
      quantity: cart[it.id],
    }));

  const cartCount = cartLines.reduce((sum, l) => sum + l.quantity, 0);

  const available = items.filter((it) => it.available);
  const popular = available.slice(0, 4);

  return (
    <ScrollView className="flex-1 bg-slate-900 px-5">
      {/* Header */}
      <LinearGradient
        colors={["#4f46e5", "#818cf8", "#6366f1"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="rounded-2xl p-6 mt-10 mb-6 shadow-2xl"
      >
        <View className="flex-row justify-between items-center">
          <View>
            <Text className="text-white text-2xl font-bold tracking-wide">
              Welcome to MEC Eatz!
            </Text>
            <Text className="text-indigo-200 text-lg mt-1 font-medium">
              Hello, {username} 👋
            </Text>
          </View>
          <View className="items-end">
            <Text className="text-indigo-200 text-sm font-medium">
              Wallet Balance
            </Text>
            <Text className="text-green-300 font-extrabold text-3xl mt-1 tracking-wider">
              ₹{Number(user?.balance ?? 0).toFixed(2)}
            </Text>
          </View>
        </View>
      </LinearGradient>

      {/* Quick Actions */}
      <View className="flex-row flex-wrap justify-between mb-6">
        <Link
          href={{
            pathname: "/Cart/cart",
            params: { items: JSON.stringify(cartLines) },
          }}
          asChild
        >
          <TouchableOpacity className="w-[48%] bg-white/10 rounded-xl p-5 items-center justify-center mb-3 border border-white/20 shadow-lg">
            <Text className="text-4xl mb-2">🛒</Text>
            <Text className="font-semibold text-center text-white">
              View Cart{cartCount > 0 ? ` (${cartCount})` : ""}
            </Text>
          </TouchableOpacity>
        </Link>

        <Link href={"/Pay/paymentredirecting"} asChild>
          <TouchableOpacity className="w-[48%] bg-white/10 rounded-xl p-5 items-center justify-center mb-3 border border-white/20 shadow-lg">
            <Text className="text-4xl mb-2">💳</Text>
            <Text className="font-semibold text-center text-white">
              Add Money
            </Text>
          </TouchableOpacity>
        </Link>

        <Link href={"/Trans_History/history"} asChild>
          <TouchableOpacity className="w-[48%] bg-white/10 rounded-xl p-5 items-center justify-center mb-3 border border-white/20 shadow-lg">
            <Text className="text-4xl mb-2">📊</Text>
            <Text className="font-semibold text-center text-white">
              History
            </Text>
          </TouchableOpacity>
        </Link>

        <TouchableOpacity className="w-[48%] bg-white/10 rounded-xl p-5 items-center justify-center mb-3 border border-indigo-400 shadow-lg">
          <Text className="text-4xl mb-2">🔐</Text>
          <Text className="font-semibold text-center text-white">Biometric</Text>
        </TouchableOpacity>
      </View>

      {/* Popular */}
      {popular.length > 0 && (
        <View className="mb-6">
          <Text className="text-xl font-bold mb-4 text-white">
            Popular Today 🔥
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="py-2">
            {popular.map((item) => (
              <View
                key={item.id}
                className="bg-white/10 rounded-xl p-4 mr-4 shadow-lg w-40 items-center border border-white/20"
              >
                <Text className="text-4xl mb-2">{emojiFor(item.name)}</Text>
                <Text className="font-semibold text-center text-white">
                  {item.name}
                </Text>
                <Text className="text-indigo-400 font-bold mt-1 text-lg">
                  ₹{item.price}
                </Text>
              </View>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Menu */}
      <View className="bg-white rounded-2xl p-6 mb-32 shadow-xl">
        <Text className="text-xl font-bold mb-4 text-gray-800">
          Today's Menu 🍽️
        </Text>

        {loading ? (
          <ActivityIndicator size="large" color="#4F46E5" className="my-6" />
        ) : available.length === 0 ? (
          <Text className="text-gray-500 text-center py-6">
            No items available right now.
          </Text>
        ) : (
          available.map((item, index) => {
            const qty = cart[item.id] || 0;
            return (
              <View
                key={item.id}
                className={`flex-row items-center justify-between py-3 ${
                  index < available.length - 1 ? "border-b border-gray-100" : ""
                }`}
              >
                <Text className="text-3xl mr-4">{emojiFor(item.name)}</Text>
                <View className="flex-1">
                  <Text className="font-semibold text-lg text-gray-800">
                    {item.name}
                  </Text>
                  <Text className="text-indigo-600 font-bold">₹{item.price}</Text>
                </View>

                {qty > 0 ? (
                  <View className="flex-row items-center">
                    <TouchableOpacity
                      onPress={() => removeFromCart(item.id)}
                      className="bg-gray-200 rounded-full w-9 h-9 items-center justify-center"
                    >
                      <Text className="text-gray-800 text-2xl">−</Text>
                    </TouchableOpacity>
                    <Text className="mx-3 font-bold text-gray-800 text-lg">
                      {qty}
                    </Text>
                    <TouchableOpacity
                      onPress={() => addToCart(item.id)}
                      className="bg-indigo-600 rounded-full w-9 h-9 items-center justify-center"
                    >
                      <Text className="text-white text-2xl">+</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <TouchableOpacity
                    onPress={() => addToCart(item.id)}
                    className="bg-indigo-600 rounded-full w-10 h-10 items-center justify-center"
                  >
                    <Text className="text-white text-2xl">+</Text>
                  </TouchableOpacity>
                )}
              </View>
            );
          })
        )}
      </View>
    </ScrollView>
  );
}
