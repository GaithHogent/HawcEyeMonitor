// src/screens/RoomScreen.tsx
import React, { useMemo, useState } from "react";
import { View, StyleSheet, Pressable, Text, LayoutChangeEvent, Modal } from "react-native";
import { useRoute } from "@react-navigation/native";

import Animated, {
  useSharedValue,
  runOnJS,
} from "react-native-reanimated";
import { Gesture, GestureDetector } from "react-native-gesture-handler";

import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";

import Floor1Svg from "../components/full-floor-map-screen/Floor1Svg";
import Floor2Svg from "../components/full-floor-map-screen/Floor2Svg";
import Floor3Svg from "../components/full-floor-map-screen/Floor3Svg";

type Params = { floorId: string; roomId: string };

type DeviceType = "camera" | "alarm" | "sprinkler" | "access";
type PlacedDevice = { id: string; type: DeviceType; x: number; y: number };

const TOOLBAR_H = 52;
const MARKER_SIZE = 28;

// default margins (لغرف عادية)
const DEFAULT_MARGIN_X = 0.18; // يمين/يسار
const DEFAULT_MARGIN_TOP = 0.12; // فوق
const DEFAULT_MARGIN_BOTTOM = 0.18; // جوه

export default function RoomScreen() {
  const { params } = useRoute<any>();
  const { floorId, roomId } = params as Params;

  const content = useMemo(() => {
    if (floorId === "1") return <Floor1Svg onlyRoomId={roomId} />;
    if (floorId === "2") return <Floor2Svg onlyRoomId={roomId} />;
    return <Floor3Svg onlyRoomId={roomId} />;
  }, [floorId, roomId]);

  // ===== margins حسب نوع الغرفة (fix للـ stairs/corridor/restroom) =====
  const rid = (roomId ?? "").toLowerCase();

  let mx = DEFAULT_MARGIN_X;
  let mt = DEFAULT_MARGIN_TOP;
  let mb = DEFAULT_MARGIN_BOTTOM;

  if (rid.includes("corridor")) {
    mx = 0.42;
    mt = 0.08;
    mb = 0.08;
  } else if (rid.includes("stairs")) {
    mx = 0.30;
    mt = 0.25;
    mb = 0.25;
  } else if (rid.includes("restroom") || rid === "wc") {
    mx = 0.34;
    mt = 0.22;
    mb = 0.22;
  }

  // نخزنها كـ shared values حتى نستخدمها داخل worklets بدون كراش
  const marginX = useSharedValue(mx);
  const marginTop = useSharedValue(mt);
  const marginBottom = useSharedValue(mb);

  // (تم حذف الزوم/الحركة بالكامل) نخلي scale ثابت = 1
  const scale = useSharedValue(1);

  // مساحة الـ stage
  const [stageBox, setStageBox] = useState({ x: 0, y: 0, w: 0, h: 0 });
  const stageW = useSharedValue(0);
  const stageH = useSharedValue(0);

  // أجهزة مثبتة داخل الغرفة
  const [placed, setPlaced] = useState<PlacedDevice[]>([]);

  // سحب جارٍ (screen coords)
  const [drag, setDrag] = useState<{ type: DeviceType; x: number; y: number } | null>(null);

  // Popup details
  const [selected, setSelected] = useState<PlacedDevice | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  const openDetails = (item: PlacedDevice) => {
    setSelected(item);
    setDetailsOpen(true);
  };

  const closeDetails = () => {
    setDetailsOpen(false);
    setSelected(null);
  };

  const onDeleteSelected = () => {
    if (!selected) return;
    setPlaced((prev) => prev.filter((p) => p.id !== selected.id));
    closeDetails();
  };

  const onEditSelected = () => {
    closeDetails();
  };

  const onStageLayout = (e: LayoutChangeEvent) => {
    const { x, y, width, height } = e.nativeEvent.layout;
    setStageBox({ x, y, w: width, h: height });
    stageW.value = width;
    stageH.value = height;
  };

  const updatePlaced = (id: string, x: number, y: number) => {
    setPlaced((prev) => prev.map((p) => (p.id === id ? { ...p, x, y } : p)));
  };

  // منطقة الغرفة "المسموح بها" داخل stage (screen coords)
  const getAllowedRectScreen = () => {
    const ax = stageBox.x + stageBox.w * marginX.value;
    const aw = stageBox.w * (1 - marginX.value * 2);

    const ay = stageBox.y + stageBox.h * marginTop.value;
    const ah = stageBox.h * (1 - marginTop.value - marginBottom.value);

    return { x: ax, y: ay, w: aw, h: ah };
  };

  // منطقة الغرفة "المسموح بها" داخل محتوى الـ canvas (content coords) (scale ثابت = 1)
  const getAllowedRectContent = () => {
    const contentW = stageW.value; // /1
    const contentH = stageH.value; // /1

    const x = contentW * marginX.value;
    const w = contentW * (1 - marginX.value * 2);

    const y = contentH * marginTop.value;
    const h = contentH * (1 - marginTop.value - marginBottom.value);

    return { x, y, w, h };
  };

  const placeIfInside = (type: DeviceType, absX: number, absY: number) => {
    const allowed = getAllowedRectScreen();

    const inside =
      absX >= allowed.x &&
      absX <= allowed.x + allowed.w &&
      absY >= allowed.y &&
      absY <= allowed.y + allowed.h;

    if (!inside) return;

    // screen -> content (بدون tx/ty وبدون scale)
    const localX = absX - stageBox.x;
    const localY = absY - stageBox.y;

    const a = getAllowedRectContent();
    if (localX < a.x || localX > a.x + a.w || localY < a.y || localY > a.y + a.h) return;

    const id = `${type}-${Date.now()}`;
    setPlaced((prev) => [...prev, { id, type, x: localX, y: localY }]);
  };

  // -------- Drag from toolbar (Long press then drag) --------
  const makeToolGesture = (type: DeviceType) =>
    Gesture.Pan()
      .activateAfterLongPress(250)
      .onBegin((e) => {
        runOnJS(setDrag)({ type, x: e.absoluteX, y: e.absoluteY });
      })
      .onUpdate((e) => {
        runOnJS(setDrag)({ type, x: e.absoluteX, y: e.absoluteY });
      })
      .onEnd((e) => {
        runOnJS(setDrag)(null);
        runOnJS(placeIfInside)(type, e.absoluteX, e.absoluteY);
      })
      .onFinalize(() => {
        runOnJS(setDrag)(null);
      });

  // -------- Drag placed markers (ضغط مطول ثم سحب) --------
  const dragStartX = useSharedValue(0);
  const dragStartY = useSharedValue(0);

  const makePlacedGesture = (id: string, startX: number, startY: number) =>
    Gesture.Pan()
      .activateAfterLongPress(250)
      .onStart(() => {
        dragStartX.value = startX;
        dragStartY.value = startY;
      })
      .onUpdate((e) => {
        const nextX = dragStartX.value + e.translationX; // scale=1
        const nextY = dragStartY.value + e.translationY; // scale=1

        const contentW = stageW.value;
        const contentH = stageH.value;

        const ax = contentW * marginX.value;
        const aw = contentW * (1 - marginX.value * 2);

        const ay = contentH * marginTop.value;
        const ah = contentH * (1 - marginTop.value - marginBottom.value);

        const clampedX = Math.min(Math.max(ax, nextX), ax + aw);
        const clampedY = Math.min(Math.max(ay, nextY), ay + ah);

        runOnJS(updatePlaced)(id, clampedX, clampedY);
      });

  const renderToolIcon = (type: DeviceType) => {
    if (type === "camera") return <Ionicons name="camera-outline" size={22} color="#111827" />;
    if (type === "alarm") return <MaterialCommunityIcons name="fire-alert" size={22} color="#111827" />;
    if (type === "sprinkler") return <MaterialCommunityIcons name="sprinkler" size={22} color="#111827" />;
    return <MaterialCommunityIcons name="badge-account-outline" size={22} color="#111827" />;
  };

  const renderMarkerIcon = (type: DeviceType) => {
    if (type === "camera") return <Ionicons name="camera" size={18} color="#111827" />;
    if (type === "alarm") return <MaterialCommunityIcons name="fire-alert" size={18} color="#111827" />;
    if (type === "sprinkler") return <MaterialCommunityIcons name="sprinkler" size={18} color="#111827" />;
    return <MaterialCommunityIcons name="badge-account-outline" size={18} color="#111827" />;
  };

  return (
    <View style={styles.root}>
      <View style={styles.toolbar}>
        <GestureDetector gesture={makeToolGesture("camera")}>
          <View style={styles.toolBtn}>{renderToolIcon("camera")}</View>
        </GestureDetector>

        <GestureDetector gesture={makeToolGesture("alarm")}>
          <View style={styles.toolBtn}>{renderToolIcon("alarm")}</View>
        </GestureDetector>

        <GestureDetector gesture={makeToolGesture("sprinkler")}>
          <View style={styles.toolBtn}>{renderToolIcon("sprinkler")}</View>
        </GestureDetector>

        <GestureDetector gesture={makeToolGesture("access")}>
          <View style={styles.toolBtn}>{renderToolIcon("access")}</View>
        </GestureDetector>
      </View>

      <View style={styles.stageWrap} onLayout={onStageLayout}>
        {/* (تم حذف GestureDetector الخاص بالزوم/الحركة) */}
        <Animated.View style={styles.stage}>
          <View style={styles.canvas}>
            {content}

            {placed.map((d) => (
              <GestureDetector key={d.id} gesture={makePlacedGesture(d.id, d.x, d.y)}>
                <Pressable
                  onPress={() => openDetails(d)}
                  style={[
                    styles.marker,
                    {
                      left: d.x - MARKER_SIZE / 2,
                      top: d.y - MARKER_SIZE / 2,
                    },
                  ]}
                >
                  {renderMarkerIcon(d.type)}
                </Pressable>
              </GestureDetector>
            ))}
          </View>
        </Animated.View>

        {drag && (
          <View
            pointerEvents="none"
            style={[
              styles.ghost,
              {
                left: drag.x - MARKER_SIZE / 2,
                top: drag.y - MARKER_SIZE / 2,
              },
            ]}
          >
            {renderMarkerIcon(drag.type)}
          </View>
        )}
      </View>

      <Modal visible={detailsOpen} transparent animationType="fade" onRequestClose={closeDetails}>
        <Pressable style={styles.modalBackdrop} onPress={closeDetails}>
          <Pressable style={styles.modalCard} onPress={() => {}}>
            <Text style={styles.modalTitle}>Device details</Text>
            <Text style={styles.modalRow}>Type: {selected?.type ?? "-"}</Text>
            <Text style={styles.modalRow}>Room: {roomId}</Text>

            <View style={styles.modalActions}>
              <Pressable style={[styles.modalBtn, styles.modalBtnOutline]} onPress={onEditSelected}>
                <Text style={styles.modalBtnOutlineText}>Edit</Text>
              </Pressable>

              <Pressable style={[styles.modalBtn, styles.modalBtnDanger]} onPress={onDeleteSelected}>
                <Text style={styles.modalBtnDangerText}>Delete</Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#fff", overflow: "hidden" },

  toolbar: {
    height: TOOLBAR_H,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    backgroundColor: "#fff",
  },
  toolBtn: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f3f4f6",
  },

  stageWrap: { flex: 1 },

  stage: { flex: 1 },
  canvas: { flex: 1 },

  marker: {
    position: "absolute",
    width: MARKER_SIZE,
    height: MARKER_SIZE,
    borderRadius: 10,
    backgroundColor: "#f3f4f6",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },

  ghost: {
    position: "absolute",
    width: MARKER_SIZE,
    height: MARKER_SIZE,
    borderRadius: 10,
    backgroundColor: "rgba(243,244,246,0.9)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },

  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    padding: 20,
    justifyContent: "center",
  },
  modalCard: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 16,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 10,
  },
  modalRow: {
    fontSize: 14,
    color: "#374151",
    marginBottom: 6,
  },
  modalActions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 14,
  },
  modalBtn: {
    flex: 1,
    height: 44,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  modalBtnOutline: {
    borderWidth: 1,
    borderColor: "#111827",
    backgroundColor: "#fff",
  },
  modalBtnOutlineText: {
    color: "#111827",
    fontWeight: "700",
  },
  modalBtnDanger: {
    backgroundColor: "#b91c1c",
  },
  modalBtnDangerText: {
    color: "#fff",
    fontWeight: "700",
  },
});
