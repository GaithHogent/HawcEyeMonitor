// src/screens/WebsiteScreen.tsx
import { View, TouchableOpacity, BackHandler } from "react-native";
import React, { useRef, useState, useCallback, useEffect } from "react";
import { WebView } from "react-native-webview";
import { MaterialCommunityIcons } from "@expo/vector-icons";

const WebsiteScreen = () => {
  const webRef = useRef<WebView>(null);
  const [canGoBack, setCanGoBack] = useState(false);

  const goBack = useCallback(() => {
    if (canGoBack) webRef.current?.goBack();
  }, [canGoBack]);

  useEffect(() => {
    const onHardwareBackPress = () => {
      if (canGoBack) {
        webRef.current?.goBack();
        return true;
      }
      return false;
    };

    const subscription = BackHandler.addEventListener("hardwareBackPress", onHardwareBackPress);
    return () => subscription.remove();
  }, [canGoBack]);

  return (
    <View className="flex-1 bg-white">
      {canGoBack && (
        <View className="flex-row items-center px-3 py-2 bg-gray-50 border-b border-gray-200">
          <TouchableOpacity
            onPress={goBack}
            className="flex-row items-center gap-1 p-[6px]"
            disabled={!canGoBack}
            accessibilityRole="button"
          >
            <MaterialCommunityIcons name="arrow-left" size={22} color="#007AFF" />
          </TouchableOpacity>
        </View>
      )}

      <WebView
        ref={webRef}
        source={{ uri: "https://hawc-servers.com/en/" }}
        startInLoadingState
        onNavigationStateChange={(nav) => setCanGoBack(Boolean(nav.canGoBack))}
        sharedCookiesEnabled={true}
        thirdPartyCookiesEnabled={true}
        domStorageEnabled={true}
      />
    </View>
  );
};

export default WebsiteScreen;
