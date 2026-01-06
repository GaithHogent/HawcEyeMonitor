// src/components/full-floor-map-screen/SvgMapViewer.tsx
import { View, StyleSheet, Dimensions, LayoutChangeEvent } from "react-native";
import { SvgXml } from "react-native-svg";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from "react-native-reanimated";
import { useEffect } from "react";

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get("window");

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
  const mapH = SCREEN_H - PANEL_H;

  // أبعاد المنطقة الفعلية (تتحدد بـ onLayout)
  const wrapW = useSharedValue(SCREEN_W);
  const wrapH = useSharedValue(mapH);

  // تحويل viewBox -> screen (على scale=1)
  const baseScale = useSharedValue(Math.min(SCREEN_W / VIEWBOX_W, mapH / VIEWBOX_H));
  const baseOffsetX = useSharedValue((SCREEN_W - VIEWBOX_W * baseScale.value) / 2);
  const baseOffsetY = useSharedValue((mapH - VIEWBOX_H * baseScale.value) / 2);

  // الغرف داخل SharedValue حتى الـ tap worklet يقرأها
  const roomsSV = useSharedValue<Room[]>([]);

  useEffect(() => {
    roomsSV.value = parseRoomsFromSvg(svgXml);
    // reset لكل طابق جديد حتى ما تبقى transform من طابق سابق
    scale.value = 1;
    tx.value = 0;
    ty.value = 0;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [svgXml]);

  // الكاميرا: transform = translate ثم scale
  // screen = (p + t) * s
  const scale = useSharedValue(1);
  const tx = useSharedValue(0);
  const ty = useSharedValue(0);

  const lastTx = useSharedValue(0);
  const lastTy = useSharedValue(0);
  const lastScale = useSharedValue(1);

  const onLayout = (e: LayoutChangeEvent) => {
    const w = e.nativeEvent.layout.width;
    const h = e.nativeEvent.layout.height;

    wrapW.value = w;
    wrapH.value = h;

    const bs = Math.min(w / VIEWBOX_W, h / VIEWBOX_H);
    baseScale.value = bs;
    baseOffsetX.value = (w - VIEWBOX_W * bs) / 2;
    baseOffsetY.value = (h - VIEWBOX_H * bs) / 2;
  };

  const reset = () => {
    scale.value = withTiming(1, { duration: 260 });
    tx.value = withTiming(0, { duration: 260 });
    ty.value = withTiming(0, { duration: 260 });
  };

  const zoomToRoomWorklet = (r: Room) => {
    "worklet";

    const sw = r.w + PAD * 2;
    const sh = r.h + PAD * 2;

    const bs = baseScale.value;

    const sx = wrapW.value / (sw * bs);
    const sy = wrapH.value / (sh * bs);

    const targetScale = clamp(Math.min(sx, sy), MIN_SCALE, MAX_SCALE);

    const cx = r.x + r.w / 2;
    const cy = r.y + r.h / 2;

    // مركز الغرفة على scale=1 داخل wrap
    const px = baseOffsetX.value + bs * cx;
    const py = baseOffsetY.value + bs * cy;

    // نريد: (px + tx) * s = center => tx = center/s - px
    const targetTx = wrapW.value / 2 / targetScale - px;
    const targetTy = wrapH.value / 2 / targetScale - py;

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
      // لأن tx/ty قبل الـ scale
      tx.value = lastTx.value + e.translationX / scale.value;
      ty.value = lastTy.value + e.translationY / scale.value;
    });

  const pinch = Gesture.Pinch()
    .onBegin(() => {
      lastScale.value = scale.value;
    })
    .onUpdate((e) => {
      const next = lastScale.value * e.scale;
      scale.value = clamp(next, MIN_SCALE, MAX_SCALE);
    });

  // tap على UI thread (بدون runOnJS) حتى تكون القيم صحيحة 100%
  const tap = Gesture.Tap()
    .maxDistance(10)
    .onEnd((e) => {
      "worklet";

      // inverse: p = screen/s - t
      const sx = e.x / scale.value - tx.value;
      const sy = e.y / scale.value - ty.value;

      // screen->viewBox
      const wx = (sx - baseOffsetX.value) / baseScale.value;
      const wy = (sy - baseOffsetY.value) / baseScale.value;

      const rooms = roomsSV.value;
      for (let i = 0; i < rooms.length; i++) {
        const r = rooms[i];
        if (wx >= r.x && wx <= r.x + r.w && wy >= r.y && wy <= r.y + r.h) {
          zoomToRoomWorklet(r);
          break;
        }
      }
    });

  const doubleTap = Gesture.Tap()
    .numberOfTaps(2)
    .maxDelay(260)
    .onEnd(() => {
      "worklet";
      reset();
    });

  const gesture = Gesture.Simultaneous(
    Gesture.Simultaneous(pan, pinch),
    Gesture.Exclusive(doubleTap, tap)
  );

  const anim = useAnimatedStyle(() => ({
    transform: [{ translateX: tx.value }, { translateY: ty.value }, { scale: scale.value }],
  }));

  return (
    <View style={styles.container}>
      <View style={[styles.mapArea, { height: mapH }]} onLayout={onLayout}>
        <GestureDetector gesture={gesture}>
          <Animated.View style={[styles.content, { height: mapH }, anim]}>
            {/* الـ SVG نفسه ثابت داخل wrap، والـ camera هي اللي تتحرك */}
            <View
              style={{
                position: "absolute",
                left: (SCREEN_W - VIEWBOX_W * baseScale.value) / 2,
                top: (mapH - VIEWBOX_H * baseScale.value) / 2,
              }}
            >
              <SvgXml
                xml={svgXml}
                width={VIEWBOX_W * baseScale.value}
                height={VIEWBOX_H * baseScale.value}
                viewBox={`0 0 ${VIEWBOX_W} ${VIEWBOX_H}`}
              />
            </View>
          </Animated.View>
        </GestureDetector>
      </View>

      <View style={styles.panel} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  mapArea: { width: SCREEN_W, overflow: "hidden" },
  content: { width: SCREEN_W },
  panel: { height: PANEL_H },
});
