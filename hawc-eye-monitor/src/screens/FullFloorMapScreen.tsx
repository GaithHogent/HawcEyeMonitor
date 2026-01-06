// src/screens/FullFloorMapScreen.tsx
import { StyleSheet } from "react-native";
import { useRoute } from "@react-navigation/native";

import Floor1Svg, { FLOOR1_ZOOM_MAP } from "../components/full-floor-map-screen/Floor1Svg";
import Floor2Svg, { FLOOR2_ZOOM_MAP } from "../components/full-floor-map-screen/Floor2Svg";
import Floor3Svg, { FLOOR3_ZOOM_MAP } from "../components/full-floor-map-screen/Floor3Svg";
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from "react-native-reanimated";

type Params = { floorId: string };

export default function FullFloorMapScreen() {
  const { params } = useRoute<any>();
  const { floorId } = params as Params;

  const scale = useSharedValue(1);
  const tx = useSharedValue(0);
  const ty = useSharedValue(0);

  const zoomTo = (id: string) => {
    // محاذاة دقيقة: نقل مركز الغرفة إلى مركز الـ viewBox (380, 580)
    const maps: Record<string, Record<string, { x: number; y: number; s: number }>> = {
      "1": FLOOR1_ZOOM_MAP,
      "2": FLOOR2_ZOOM_MAP,
      "3": FLOOR3_ZOOM_MAP,
    };

    const map = maps[floorId];
    const t = map?.[id];
    if (!t) return;

    scale.value = withTiming(t.s, { duration: 300 });
    tx.value = withTiming(t.x, { duration: 300 });
    ty.value = withTiming(t.y, { duration: 300 });
  };

  const anim = useAnimatedStyle(() => ({
    transform: [{ translateX: tx.value }, { translateY: ty.value }, { scale: scale.value }],
  }));

  return (
    <Animated.View style={[{ flex: 1 }, anim]}>
      {floorId === "1" ? (
        <Floor1Svg onRoomPress={zoomTo} />
      ) : floorId === "2" ? (
        <Floor2Svg onRoomPress={zoomTo} />
      ) : (
        <Floor3Svg onRoomPress={zoomTo} />
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
});
