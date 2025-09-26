// import "../../global.css";
// import React from "react";
// import { View, Text, TouchableOpacity, ScrollView } from "react-native";

// export default function StudentScreen() {
//   const quickActions = [
//     { icon: "📱", title: "QR Order" },
//     { icon: "💳", title: "Add Money" },
//     { icon: "📊", title: "History" },
//     { icon: "🍽️", title: "Biometric" },
//   ];

//   const menuItems = [
//     { icon: "🍛", name: "Chicken Biriyani", price: "₹85" },
//     { icon: "🍕", name: "Margherita Pizza", price: "₹120" },
//     { icon: "🥗", name: "Caesar Salad", price: "₹65" },
//   ];

//   return (
//     <ScrollView className="flex-1 bg-indigo-500 px-5">
//       {/* Welcome Section */}
//       <View className="bg-white/20 rounded-2xl p-6 mt-10 mb-6">
//         <Text className="text-white text-xl font-bold">Hi, Ajay! 👋</Text>
//         <Text className="text-white mt-1">
//           Wallet Balance:{" "}
//           <Text className="text-yellow-400 font-bold">₹750</Text>
//         </Text>
//       </View>

//       {/* Quick Actions */}
//       <View className="flex-row flex-wrap justify-between mb-6">
//         {quickActions.map((a) => (
//           <TouchableOpacity
//             key={a.title}
//             className="w-[48%] bg-white rounded-xl p-6 items-center mb-3"
//           >
//             <Text className="text-2xl mb-2">{a.icon}</Text>
//             <Text className="font-semibold">{a.title}</Text>
//           </TouchableOpacity>
//         ))}
//       </View>

//       {/* Menu Section */}
//       <View className="bg-white rounded-2xl p-6 mb-6">
//         <Text className="text-lg font-bold mb-4">Today's Menu</Text>
//         {menuItems.map((item) => (
//           <View
//             key={item.name}
//             className="flex-row items-center justify-between mb-4"
//           >
//             <Text className="text-2xl mr-3">{item.icon}</Text>
//             <View className="flex-1">
//               <Text className="font-semibold text-base">{item.name}</Text>
//               <Text className="text-indigo-600">{item.price}</Text>
//             </View>
//             <TouchableOpacity className="bg-indigo-600 rounded-md px-3 py-1">
//               <Text className="text-white text-lg">+</Text>
//             </TouchableOpacity>
//           </View>
//         ))}
//       </View>
//     </ScrollView>
//   );
// }

// import React from "react";
// import { ScrollView, Text, TouchableOpacity, View } from "react-native";
// import "../../global.css";

// export default function StudentScreen() {
//   const quickActions = [
//     { icon: "📱", title: "QR Order" },
//     { icon: "💳", title: "Add Money" },
//     { icon: "📊", title: "History" },
//     { icon: "🍽️", title: "Biometric" },
//   ];

//   const popularItems = [
//     { icon: "🍔", name: "Chicken Burger", price: "₹90" },
//     { icon: "☕", name: "Hot Coffee", price: "₹35" },
//     { icon: "🥪", name: "Veg Sandwich", price: "₹50" },
//   ];

//   const menuItems = [
//     { icon: "🍛", name: "Chicken Biriyani", price: "₹85" },
//     { icon: "🍕", name: "Margherita Pizza", price: "₹120" },
//     { icon: "🥗", name: "Caesar Salad", price: "₹65" },
//   ];

//   return (
//     <ScrollView className="flex-1 bg-gray-100 px-5">
//       {/* Welcome Section */}
//       <View className="bg-indigo-600 rounded-2xl p-6 mt-10 mb-6 shadow-md">
//         <Text className="text-white text-2xl font-bold">Hi, Ajay! 👋</Text>
//         <Text className="text-indigo-200 mt-2 text-base">
//           Wallet Balance:{" "}
//           <Text className="text-yellow-300 font-bold text-lg">₹750</Text>
//         </Text>
//       </View>

//       {/* Quick Actions */}
//       <View className="flex-row flex-wrap justify-between mb-6">
//         {quickActions.map((a) => (
//           <TouchableOpacity
//             key={a.title}
//             className="w-[48%] bg-white rounded-xl p-5 items-center justify-center mb-3 shadow"
//           >
//             <Text className="text-3xl mb-2">{a.icon}</Text>
//             <Text className="font-semibold text-center text-gray-700">{a.title}</Text>
//           </TouchableOpacity>
//         ))}
//       </View>

//       {/* Popular Items Section */}
//       <View className="mb-6">
//         <Text className="text-lg font-bold mb-4 text-gray-800">Popular Today</Text>
//         <ScrollView horizontal showsHorizontalScrollIndicator={false}>
//           {popularItems.map((item) => (
//             <View
//               key={item.name}
//               className="bg-white rounded-xl p-4 mr-4 shadow w-36 items-center"
//             >
//               <Text className="text-4xl mb-2">{item.icon}</Text>
//               <Text className="font-semibold text-center">{item.name}</Text>
//               <Text className="text-indigo-600 font-bold mt-1">{item.price}</Text>
//             </View>
//           ))}
//         </ScrollView>
//       </View>

//       {/* --- */}

//       {/* Today's Menu Section */}
//       <View className="bg-white rounded-2xl p-6 mb-6 shadow-md">
//         <Text className="text-lg font-bold mb-4 text-gray-800">Today's Menu</Text>
//         {menuItems.map((item, index) => (
//           <View
//             key={item.name}
//             className={`flex-row items-center justify-between py-3 ${
//               index < menuItems.length - 1 ? "border-b border-gray-200" : ""
//             }`}
//           >
//             <Text className="text-2xl mr-4">{item.icon}</Text>
//             <View className="flex-1">
//               <Text className="font-semibold text-base text-gray-700">{item.name}</Text>
//               <Text className="text-indigo-600 font-bold">{item.price}</Text>
//             </View>
//             <TouchableOpacity className="bg-indigo-600 rounded-full w-8 h-8 items-center justify-center">
//               <Text className="text-white text-xl">+</Text>
//             </TouchableOpacity>
//           </View>
//         ))}
//       </View>
//     </ScrollView>
//   );
// }
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import "../../global.css";

export default function StudentScreen() {
  const quickActions = [
    { icon: "📱", title: "QR Order" },
    { icon: "💳", title: "Add Money" },
    { icon: "📊", title: "History" },
    { icon: "🍽️", title: "Biometric" },
  ];

  const popularItems = [
    { icon: "🍔", name: "Chicken Burger", price: "₹90" },
    { icon: "☕", name: "Hot Coffee", price: "₹35" },
    { icon: "🥪", name: "Veg Sandwich", price: "₹50" },
  ];

  const menuItems = [
    { icon: "🍛", name: "Chicken Biriyani", price: "₹85" },
    { icon: "🍕", name: "Margherita Pizza", price: "₹120" },
    { icon: "🥗", name: "Caesar Salad", price: "₹65" },
  ];

  return (
    <ScrollView className="flex-1 bg-slate-900 px-5">
      {/* Header, Welcome, and Balance Section with Dynamic Gradient */}
      <LinearGradient
        colors={['#4f46e5', '#818cf8', '#6366f1']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="rounded-2xl p-6 mt-10 mb-6 shadow-2xl"
      >
        <View className="flex-row justify-between items-center">
          <View>
            <Text className="text-white text-2xl font-bold tracking-wide">Welcome to MEC Eatz!</Text>
            <Text className="text-indigo-200 text-lg mt-1 font-medium">Hello, Ajay 👋</Text>
          </View>
          <View className="items-end">
            <Text className="text-indigo-200 text-sm font-medium">Current Balance</Text>
            <Text className="text-green-300 font-extrabold text-3xl mt-1 tracking-wider">₹750</Text>
          </View>
        </View>
      </LinearGradient>

      {/* Quick Actions with Glassmorphism Effect */}
      <View className="flex-row flex-wrap justify-between mb-6">
        {quickActions.map((a) => (
          <TouchableOpacity
            key={a.title}
            className={`w-[48%] bg-white/10 rounded-xl p-5 items-center justify-center mb-3 border border-white/20 backdrop-blur-md shadow-lg ${
              a.title === "Biometric" ? "border-indigo-400" : ""
            }`}
          >
            <Text className="text-4xl mb-2">{a.icon}</Text>
            <Text className="font-semibold text-center text-white">{a.title}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Popular Items Section with Glassmorphism */}
      <View className="mb-6">
        <Text className="text-xl font-bold mb-4 text-white">Popular Today 🔥</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="py-2">
          {popularItems.map((item) => (
            <View
              key={item.name}
              className="bg-white/10 rounded-xl p-4 mr-4 shadow-lg w-40 items-center border border-white/20"
            >
              <Text className="text-4xl mb-2">{item.icon}</Text>
              <Text className="font-semibold text-center text-white">{item.name}</Text>
              <Text className="text-indigo-400 font-bold mt-1 text-lg">{item.price}</Text>
            </View>
          ))}
        </ScrollView>
      </View>

      {/* Today's Menu Section */}
      <View className="bg-white rounded-2xl p-6 mb-6 shadow-xl">
        <Text className="text-xl font-bold mb-4 text-gray-800">Today's Menu 🍽️</Text>
        {menuItems.map((item, index) => (
          <View
            key={item.name}
            className={`flex-row items-center justify-between py-3 ${
              index < menuItems.length - 1 ? "border-b border-gray-100" : ""
            }`}
          >
            <Text className="text-3xl mr-4">{item.icon}</Text>
            <View className="flex-1">
              <Text className="font-semibold text-lg text-gray-800">{item.name}</Text>
              <Text className="text-indigo-600 font-bold">{item.price}</Text>
            </View>
            <TouchableOpacity className="bg-indigo-600 rounded-full w-10 h-10 items-center justify-center">
              <Text className="text-white text-2xl">+</Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}