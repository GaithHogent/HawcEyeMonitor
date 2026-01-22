// src/components/dashboard-screen/WebsitePreview.tsx
import { View } from "react-native";
import { WebView } from "react-native-webview";

type Props = {
  url: string;
  height?: number;
};

const WebsitePreview = ({ url, height = 220 }: Props) => {
  return (
    <View
      className="w-full bg-white rounded-2xl overflow-hidden"
      style={{ height, elevation: 1 }}
    >
      <WebView
        source={{ uri: url }}
        javaScriptEnabled
        domStorageEnabled
        startInLoadingState
      />
    </View>
  );
}

export default WebsitePreview;
