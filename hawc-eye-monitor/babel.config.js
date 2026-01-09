// babel.config.js
module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      ["babel-preset-expo", { jsxImportSource: "nativewind" }],
      "nativewind/babel",
    ],
    // مع Expo SDK 54 غالباً ما تحتاج تضيف أي plugin لـ Reanimated لأن babel-preset-expo يسويه تلقائياً
    plugins: [],
  };
};
