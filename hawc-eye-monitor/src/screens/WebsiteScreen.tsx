// src/screens/WebsiteScreen.tsx
import { View, StyleSheet } from "react-native";
import { WebView } from "react-native-webview";

const WebsiteScreen = () => {
  return (
    <View style={styles.container}>
      <WebView
        source={{ uri: "https://hawc-servers.com/en/" }}
        javaScriptEnabled
        domStorageEnabled
        startInLoadingState
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
});

export default WebsiteScreen;
