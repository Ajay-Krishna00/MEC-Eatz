import { useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import QRCode from "react-native-qrcode-svg";
import "../../global.css";

/**
 * Order confirmation + QR pickup pass. The counter scans this QR (or the staff
 * enters the 6-digit code) to verify and hand over the order.
 */
export default function PickupScreen() {
  const { code, total } = useLocalSearchParams();
  const router = useRouter();

  const pickupCode = String(code || "------");
  // What staff verify against — the pickup code embedded in a QR payload.
  const qrValue = JSON.stringify({ app: "mec-eatz", pickup: pickupCode });

  return (
    <View className="flex-1 bg-slate-900 items-center justify-center px-6">
      <Text className="text-5xl mb-3">✅</Text>
      <Text className="text-white text-2xl font-bold mb-1">Order Confirmed</Text>
      <Text className="text-gray-400 mb-8 text-center">
        Show this QR at the counter to collect your order.
      </Text>

      <View className="bg-white rounded-2xl p-6 items-center">
        <QRCode value={qrValue} size={200} />
        <Text className="text-gray-500 mt-4 text-sm">Pickup Code</Text>
        <Text className="text-slate-900 text-4xl font-extrabold tracking-[8px] mt-1">
          {pickupCode}
        </Text>
      </View>

      {total ? (
        <Text className="text-green-300 text-lg font-bold mt-6">
          Paid ₹{Number(total).toFixed(2)} from wallet
        </Text>
      ) : null}

      <TouchableOpacity
        className="bg-indigo-600 rounded-xl px-8 py-4 mt-10"
        onPress={() => router.replace("/(tabs)/home")}
      >
        <Text className="text-white font-bold text-lg">Back to Home</Text>
      </TouchableOpacity>
    </View>
  );
}
