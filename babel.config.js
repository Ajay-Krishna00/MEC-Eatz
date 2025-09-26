module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      "babel-preset-expo", // ✅ standard Expo preset
      "nativewind/babel", // ✅ NativeWind preset
    ],
    plugins: [
       // required by Reanimated
      "react-native-worklets/plugin", 
      // needed by NativeWind/css-interop
    ],
  };
};
