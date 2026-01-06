// src/components/full-floor-map-screen/SvgMapViewer.tsx
import { View, StyleSheet, Dimensions } from "react-native";
import { SvgXml } from "react-native-svg";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from "react-native-reanimated";

const { width, height } = Dimensions.get("window");
type Props = { svgXml: string };

type Room = { id: string; x: number; y: number; w: number; h: number };

const VIEWBOX_W = 760;
const VIEWBOX_H = 1160;

const MIN_SCALE = 1;
const MAX_SCALE = 3;
const PAD = 24;

// مساحة محجوزة تحت الخريطة (مكان الأجهزة لاحقًا)
const PANEL_H = 220;

const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));

const getAttr = (tag: string, name: string) => {
  const m = tag.match(new RegExp(`${name}="([^"]+)"`));
  return m ? m[1] : null;
};

const parseRoomsFromSvg = (xml: string): Room[] => {
  const rooms: Room[] = [];
  const gRe = /<g\s+id="([^"]+)"[^>]*>([\s\S]*?)<\/g>/g;
  let gm: RegExpExecArray | null;

  while ((gm = gRe.exec(xml)) !== null) {
    const id = gm[1];
    const body = gm[2];

    if (id === "corridor") continue;

    const rects = body.match(/<rect\b[^>]*>/g);
    if (!rects || rects.length === 0) continue;

    let best: Room | null = null;
    let bestArea = -1;

    for (let i = 0; i < rects.length; i++) {
      const rectTag = rects[i];

      const x = Number(getAttr(rectTag, "x") ?? NaN);
      const y = Number(getAttr(rectTag, "y") ?? NaN);
      const w = Number(getAttr(rectTag, "width") ?? NaN);
      const h = Number(getAttr(rectTag, "height") ?? NaN);

      if (!Number.isFinite(x) || !Number.isFinite(y) || !Number.isFinite(w) || !Number.isFinite(h)) continue;

      const area = w * h;
      if (area > bestArea) {
        bestArea = area;
        best = { id, x, y, w, h };
      }
    }

    if (best) rooms.push(best);
  }

  return rooms;
};

export default function SvgMapViewer({ svgXml }: Props) {
  const mapH = height - PANEL_H;

  const baseScale = Math.min(width / VIEWBOX_W, mapH / VIEWBOX_H);
  const baseOffsetX = (width - VIEWBOX_W * baseScale) / 2;
  const baseOffsetY = (mapH - VIEWBOX_H * baseScale) / 2;

  const rooms = parseRoomsFromSvg(svgXml);

  const scale = useSharedValue(1);
  const tx = useSharedValue(0);
  const ty = useSharedValue(0);

  const lastTx = useSharedValue(0);
  const lastTy = useSharedValue(0);
  const lastScale = useSharedValue(1);

  const reset = () => {
    scale.value = withTiming(1, { duration: 260 });
    tx.value = withTiming(0, { duration: 260 });
    ty.value = withTiming(0, { duration: 260 });
  };

  const zoomToRoom = (r: Room) => {
    const sw = r.w + PAD * 2;
    const sh = r.h + PAD * 2;

    const sx = width / (sw * baseScale);
    const sy = mapH / (sh * baseScale);

    const targetScale = clamp(Math.min(sx, sy), MIN_SCALE, MAX_SCALE);

    const cx = r.x + r.w / 2;
    const cy = r.y + r.h / 2;

    const targetTx = width / 2 - baseOffsetX - (cx * baseScale) * targetScale;
    const targetTy = mapH / 2 - baseOffsetY - (cy * baseScale) * targetScale;

    scale.value = withTiming(targetScale, { duration: 320 });
    tx.value = withTiming(targetTx, { duration: 320 });
    ty.value = withTiming(targetTy, { duration: 320 });
  };

  const pan = Gesture.Pan()
    .onBegin(() => {
      lastTx.value = tx.value;
      lastTy.value = ty.value;
    })
    .onUpdate((e) => {
      tx.value = lastTx.value + e.translationX;
      ty.value = lastTy.value + e.translationY;
    });

  const pinch = Gesture.Pinch()
    .onBegin(() => {
      lastScale.value = scale.value;
    })
    .onUpdate((e) => {
      const next = lastScale.value * e.scale;
      scale.value = clamp(next, MIN_SCALE, MAX_SCALE);
    });

  const tap = Gesture.Tap()
    .runOnJS(true)
    .maxDistance(10)
    .onEnd((e) => {
      if (e.y > mapH) return;

      const wx = (e.x - baseOffsetX - tx.value) / (baseScale * scale.value);
      const wy = (e.y - baseOffsetY - ty.value) / (baseScale * scale.value);

      const room = rooms.find((r) => wx >= r.x && wx <= r.x + r.w && wy >= r.y && wy <= r.y + r.h);
      if (room) zoomToRoom(room);
    });

  const doubleTap = Gesture.Tap()
    .runOnJS(true)
    .numberOfTaps(2)
    .maxDelay(260)
    .onEnd(() => {
      reset();
    });

  const gesture = Gesture.Exclusive(doubleTap, tap, Gesture.Simultaneous(pan, pinch));

  const anim = useAnimatedStyle(() => ({
    transform: [{ translateX: tx.value }, { translateY: ty.value }, { scale: scale.value }],
  }));

  return (
    <View style={styles.container}>
      <View style={[styles.mapArea, { height: mapH }]}>
        <GestureDetector gesture={gesture}>
          <View style={[styles.gestureSurface, { height: mapH }]}>
            <Animated.View style={[styles.content, anim]}>
              <View style={{ position: "absolute", left: baseOffsetX, top: baseOffsetY }}>
                <SvgXml
                  xml={svgXml}
                  width={VIEWBOX_W * baseScale}
                  height={VIEWBOX_H * baseScale}
                  viewBox={`0 0 ${VIEWBOX_W} ${VIEWBOX_H}`}
                />
              </View>
            </Animated.View>
          </View>
        </GestureDetector>
      </View>

      <View style={styles.panel} />
    </View>
  );
}

const styles = StyleSheet.create({
  container:{flex:1,backgroundColor:"#fff"},
  mapArea:{width},
  gestureSurface:{width},
  content:{width, height: "100%"},
  panel:{height:PANEL_H},
});
