// src/screens/FullFloorMapScreen.tsx
import { useEffect, useState } from "react";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import { useRoute } from "@react-navigation/native";
import { Asset } from "expo-asset";
import * as FileSystem from "expo-file-system/legacy";

import Floor1Svg from "../components/full-floor-map-screen/Floor1Svg";
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from "react-native-reanimated";

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

  const scale = useSharedValue(1);
  const tx = useSharedValue(0);
  const ty = useSharedValue(0);

  const zoomTo = (id: string) => {
    // محاذاة دقيقة: نقل مركز الغرفة إلى مركز الـ viewBox (380, 580)
    const map: Record<string, { x: number; y: number; s: number }> = {
      "meeting-a": { x: 190,  y: -280, s: 2.2 }, // (190,860) -> (380,580)
      "meeting-b": { x: 190,  y:  280, s: 2.2 }, // (190,300) -> (380,580)
      "office-101": { x: -190, y: -365, s: 2.2 }, // (570,945) -> (380,580)
      "office-102": { x: -190, y:   -5, s: 2.2 }, // (570,585) -> (380,580)
      "office-103": { x: -190, y:  360, s: 2.2 }, // (570,220) -> (380,580)
      restroom: { x:  -20, y: -460, s: 2.4 }, // (400,1040) -> (380,580)
      stairs:   { x:  -20, y:  460, s: 2.4 }, // (400,120)  -> (380,580)
    };

    const t = map[id];
    if (!t) return;

    scale.value = withTiming(t.s, { duration: 300 });
    tx.value = withTiming(t.x, { duration: 300 });
    ty.value = withTiming(t.y, { duration: 300 });
  };

  const anim = useAnimatedStyle(() => ({
    transform: [{ translateX: tx.value }, { translateY: ty.value }, { scale: scale.value }],
  }));

  if (!xml) return (
    <View style={styles.center}><ActivityIndicator size="large" color="#0d7ff2" /></View>
  );

  return (
    <Animated.View style={[{ flex: 1 }, anim]}>
      <Floor1Svg onRoomPress={zoomTo} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
});
