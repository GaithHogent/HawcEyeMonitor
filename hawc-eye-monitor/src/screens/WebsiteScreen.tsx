// src/screens/WebsiteScreen.tsx
import { View } from "react-native";
import { WebView } from "react-native-webview";

const WebsiteScreen = () => {
  return (
    <View className="flex-1 bg-white">
      <WebView
        source={{ uri: "https://hawc-servers.com/en/" }}
        javaScriptEnabled
        domStorageEnabled
        startInLoadingState
      />
    </View>
  );
};

export default WebsiteScreen;
