// src/components/dashboard-screen/WebsitePreview.tsx
import { View, StyleSheet } from "react-native";
import { WebView } from "react-native-webview";

type Props = {
  url: string;
  height?: number;
};

export default function WebsitePreview({ url, height = 220 }: Props) {
  return (
    <View style={[styles.container, { height }]}>
      <WebView
        source={{ uri: url }}
        javaScriptEnabled
        domStorageEnabled
        startInLoadingState
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    backgroundColor: "#fff",
    borderRadius: 16,
    overflow: "hidden",
    elevation: 1,
  },
});
