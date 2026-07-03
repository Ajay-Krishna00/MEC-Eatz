import { useAuth } from "@/context/AuthProvider";
import { useRouter } from "expo-router";
import React from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import "../../global.css";

const favoriteItems = [
  { icon: "🍕", name: "Margherita Pizza", price: "₹120" },
  { icon: "☕", name: "Hot Coffee", price: "₹35" },
  { icon: "🍛", name: "Chicken Biriyani", price: "₹85" },
];

const profile = () => {
  const { user, logout } = useAuth();
  const router = useRouter();

  const username = user?.name || user?.email || "Guest";
  const isStaff = user?.role === "staff";
  const handleLogOut = async () => {
    await logout();
    console.log("User logged out");
  };

  return (
    <ScrollView className="flex-1 bg-gray-50">
      {/* Header and Profile Section */}
      <View className="items-center bg-white p-6 pb-20 rounded-b-3xl shadow-md">
        <Text className="text-2xl font-bold text-gray-800 mt-10">Profile</Text>
        <View className="items-center mt-5 mb-4">
          <View className="w-32 h-32 rounded-full border-4 border-indigo-600 shadow-lg bg-gray-300 items-center justify-center">
            <Text className="text-5xl">👤</Text>
          </View>
          <Text className="text-3xl font-bold text-gray-900 mt-4">
            {username}
          </Text>
          <Text className="text-sm text-gray-500">MEC Roll No: 12345</Text>
        </View>
      </View>

      {/* Biometric and Wallet Status */}
      <View className="bg-indigo-600 rounded-2xl p-6 mx-5 -mt-10 mb-6 shadow-xl">
        <View className="flex-row items-center justify-between">
          <Text className="text-white text-base font-semibold">
            Biometric Wallet
          </Text>
          <View className="bg-green-300 rounded-full px-3 py-1">
            <Text className="text-green-800 font-bold">Enabled</Text>
          </View>
        </View>
        <Text className="text-indigo-200 text-xs mt-1">
          Your account is linked for biometric payments.
        </Text>
      </View>

      {/* My Favorites Section */}
      <View className="mb-6 mx-5">
        <Text className="text-lg font-bold mb-4 text-gray-800">
          My Favorites ❤️
        </Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {favoriteItems.map((item) => (
            <View
              key={item.name}
              className="bg-white rounded-xl p-4 mr-4 shadow-sm w-40 items-center border border-gray-200"
            >
              <Text className="text-4xl mb-2">{item.icon}</Text>
              <Text className="font-semibold text-center text-gray-800">
                {item.name}
              </Text>
              <Text className="text-indigo-600 font-bold mt-1 text-lg">
                {item.price}
              </Text>
            </View>
          ))}
        </ScrollView>
      </View>

      {/* Account Features */}
      <View className="bg-white rounded-2xl p-6 mx-5 mb-4 shadow-md">
        <Text className="text-lg font-bold mb-4 text-gray-800">Account</Text>
        <TouchableOpacity className="flex-row items-center justify-between py-3 border-b border-gray-100">
          <Text className="text-base font-semibold text-gray-700">
            Transaction History
          </Text>
          <Text className="text-lg text-gray-400">{">"}</Text>
        </TouchableOpacity>
        <TouchableOpacity className="flex-row items-center justify-between py-3 border-b border-gray-100">
          <Text className="text-base font-semibold text-gray-700">
            Manage Cards & UPI
          </Text>
          <Text className="text-lg text-gray-400">{">"}</Text>
        </TouchableOpacity>
        <TouchableOpacity className="flex-row items-center justify-between py-3">
          <Text className="text-base font-semibold text-gray-700">
            Settings
          </Text>
          <Text className="text-lg text-gray-400">{">"}</Text>
        </TouchableOpacity>
      </View>

      {/* Staff-only: Canteen Dashboard */}
      {isStaff && (
        <TouchableOpacity
          className="bg-indigo-600 rounded-xl p-4 mx-5 mb-4 items-center shadow-lg flex-row justify-center"
          onPress={() => router.push("/Staff/dashboard")}
        >
          <Text className="text-white text-lg font-bold">
            📊 Open Canteen Dashboard
          </Text>
        </TouchableOpacity>
      )}

      {/* Logout Button */}
      <TouchableOpacity
        className="bg-red-500 rounded-xl p-4 mx-5 mb-10 items-center shadow-lg"
        onPress={handleLogOut}
      >
        <Text className="text-white text-lg font-bold">Log Out</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default profile;
