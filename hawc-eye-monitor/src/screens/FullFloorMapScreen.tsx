// src/screens/FullFloorMapScreen.tsx
import { useEffect, useState } from "react";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import { useRoute } from "@react-navigation/native";
import { Asset } from "expo-asset";
import * as FileSystem from "expo-file-system/legacy";

import SvgMapViewer from "../components/full-floor-map-screen/SvgMapViewer";

type Params = { floorId: string; svgPath: any };

export default function FullFloorMapScreen() {
  const { params } = useRoute<any>();
  const { svgPath } = params as Params;

  const [xml, setXml] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const asset = await Asset.fromModule(svgPath).downloadAsync();
      const uri = asset.localUri ?? asset.uri;
      const text = await FileSystem.readAsStringAsync(uri);
      setXml(text);
    })();
  }, [svgPath]);

  if (!xml) return (
    <View style={styles.center}><ActivityIndicator size="large" color="#0d7ff2" /></View>
  );

  return <SvgMapViewer svgXml={xml} />;
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
});
