import { useCallback, useRef, useState } from "react";
import { Gesture } from "react-native-gesture-handler";
import { runOnJS, useAnimatedStyle, useSharedValue } from "react-native-reanimated";
import { updateDoc, doc, serverTimestamp, writeBatch } from "firebase/firestore";
import { db, auth } from "../../../config/firebase";

import type { DeviceType, PlacedDevice } from "../useRoomTypes";
import { clamp01 } from "../room.utils";

type Args = {
  roomId: string;

  rid: string;

  stageBox: { x: number; y: number; w: number; h: number };
  stageW: { value: number };
  stageH: { value: number };

  marginX: { value: number };
  marginTop: { value: number };
  marginBottom: { value: number };

  MARKER_SIZE: number;

  getRoomRectContent: () => { x: number; y: number; w: number; h: number } | null;
  clampToRoomByPx: (px: number, py: number) => { x: number; y: number; nx: number; ny: number } | null;

  placed: PlacedDevice[];
  setPlaced: (updater: any) => void;
  placedRef: { current: PlacedDevice[] };

  savedById: Record<string, { x: number; y: number }>;

  pendingIds: Set<string>;
  setPendingIds: (updater: any) => void;
  pendingIdsRef: { current: Set<string> };

  pendingPlacedRef: { current: Record<string, PlacedDevice> };

  setDraggingPlaced: (v: { id: string; type: DeviceType } | null) => void;
};

const MEETING_RIGHT_SAFE_PAD = 28;
const STAIRS_BOTTOM_SAFE_PAD = 118;
const STAIRS_RIGHT_SAFE_PAD = 12;
const CORRIDOR_BOTTOM_SAFE_PAD = 24;
const RESTROOM_PAD_LEFT = 12;
const RESTROOM_PAD_RIGHT = 16;
const RESTROOM_PAD_TOP = 60;
const RESTROOM_PAD_BOTTOM = 165;

const getCurrentUserName = () => {
  return auth.currentUser?.displayName || auth.currentUser?.email || "system";
};

export const useRoomDragDrop = ({
  roomId,
  rid,
  stageBox,
  stageW,
  stageH,
  marginX,
  marginTop,
  marginBottom,
  MARKER_SIZE,
  getRoomRectContent,
  clampToRoomByPx,
  placed,
  setPlaced,
  placedRef,
  savedById,
  pendingIds,
  setPendingIds,
  pendingIdsRef,
  pendingPlacedRef,
  setDraggingPlaced,
}: Args) => {
  const placedDragX = useSharedValue(0);
  const placedDragY = useSharedValue(0);

  const [drag, setDrag] = useState<{ id: string; type: DeviceType; x: number; y: number } | null>(null);

  const dragRafRef = useRef<number | null>(null);
  const dragQueueRef = useRef<{ id: string; type: DeviceType; x: number; y: number } | null>(null);

  const scheduleDrag = (p: { id: string; type: DeviceType; x: number; y: number } | null) => {
    dragQueueRef.current = p;
    if (dragRafRef.current != null) return;

    dragRafRef.current = requestAnimationFrame(() => {
      dragRafRef.current = null;
      setDrag(dragQueueRef.current);
    });
  };

  const placeIfInside = (deviceId: string, type: DeviceType, absX: number, absY: number) => {
    if (stageBox.w <= 0 || stageBox.h <= 0 || stageW.value <= 0 || stageH.value <= 0) return;

    const localX0 = absX - stageBox.x;
    const localY0 = absY - stageBox.y;

    const roomRect = getRoomRectContent();

    if (roomRect) {
      const DROP_PAD = 26;

      const insideNear =
        localX0 >= roomRect.x - DROP_PAD &&
        localX0 <= roomRect.x + roomRect.w + DROP_PAD &&
        localY0 >= roomRect.y - DROP_PAD &&
        localY0 <= roomRect.y + roomRect.h + DROP_PAD;

      if (!insideNear) return;

      const pos = clampToRoomByPx(localX0, localY0);
      if (!pos) return;

      pendingPlacedRef.current[deviceId] = { id: deviceId, type, x: pos.x, y: pos.y, nx: pos.nx, ny: pos.ny };

      setPlaced((prev: PlacedDevice[]) => {
        const others = prev.filter((p) => p.id !== deviceId);
        return [...others, { id: deviceId, type, x: pos.x, y: pos.y, nx: pos.nx, ny: pos.ny }];
      });

      setPendingIds((prev: Set<string>) => {
        const next = new Set(prev);
        next.add(deviceId);
        pendingIdsRef.current = next;
        return next;
      });

      return;
    }

    const contentW = stageW.value;
    const contentH = stageH.value;

    const ax = contentW * marginX.value;
    const aw = contentW * (1 - marginX.value * 2);

    const ay = contentH * marginTop.value;
    const ah = contentH * (1 - marginTop.value - marginBottom.value);

    const DROP_PAD = 26;

    const insideNear =
      localX0 >= ax - DROP_PAD &&
      localX0 <= ax + aw + DROP_PAD &&
      localY0 >= ay - DROP_PAD &&
      localY0 <= ay + ah + DROP_PAD;

    if (!insideNear) return;

    const isMeetingRoom = rid.includes("meeting");
    const isStairs = rid.includes("stairs");
    const isCorridor = rid.includes("corridor");
    const isRestroom = rid.includes("restroom") || rid === "wc";

    const minX = ax + (isRestroom ? RESTROOM_PAD_LEFT : 0);
    const maxX =
      ax +
      aw -
      (isMeetingRoom ? MEETING_RIGHT_SAFE_PAD : 0) -
      (isStairs ? STAIRS_RIGHT_SAFE_PAD : 0) -
      (isRestroom ? RESTROOM_PAD_RIGHT : 0);

    const minY = ay + (isRestroom ? RESTROOM_PAD_TOP : 0);
    const maxY =
      ay +
      ah -
      (isStairs ? STAIRS_BOTTOM_SAFE_PAD : 0) -
      (isCorridor ? CORRIDOR_BOTTOM_SAFE_PAD : 0) -
      (isRestroom ? RESTROOM_PAD_BOTTOM : 0);

    const clampedX = Math.min(Math.max(minX, localX0), maxX);
    const clampedY = Math.min(Math.max(minY, localY0), maxY);

    const nx = aw > 0 ? clamp01((clampedX - ax) / aw) : 0.5;
    const ny = ah > 0 ? clamp01((clampedY - ay) / ah) : 0.5;

    pendingPlacedRef.current[deviceId] = { id: deviceId, type, x: clampedX, y: clampedY, nx, ny };

    setPlaced((prev: PlacedDevice[]) => {
      const others = prev.filter((p) => p.id !== deviceId);
      return [...others, { id: deviceId, type, x: clampedX, y: clampedY, nx, ny }];
    });

    setPendingIds((prev: Set<string>) => {
      const next = new Set(prev);
      next.add(deviceId);
      pendingIdsRef.current = next;
      return next;
    });
  };

  const onSaveAll = async (saving: boolean, setSaving: (b: boolean) => void) => {
    if (saving) return;
    if (pendingIds.size === 0) return;

    try {
      setSaving(true);

      const batch = writeBatch(db);

      pendingIds.forEach((id) => {
        const p = pendingPlacedRef.current[id] ?? placed.find((x) => x.id === id);
        if (!p) return;

        batch.update(doc(db, "devices", id), {
          status: "active",
          roomId,
          x: p.nx,
          y: p.ny,
          updatedAt: serverTimestamp(),
          updatedBy: getCurrentUserName(),
        });
      });

      await batch.commit();

      setPendingIds(() => {
        const next = new Set<string>();
        pendingIdsRef.current = next;
        pendingPlacedRef.current = {};
        return next;
      });
    } finally {
      setSaving(false);
    }
  };

  const saveActivePosition = useCallback(
    async (id: string, x: number, y: number) => {
      if (!savedById[id]) return;

      const roomRect = getRoomRectContent();
      if (roomRect) {
        const nx = roomRect.w > 0 ? clamp01((x - roomRect.x) / roomRect.w) : 0.5;
        const ny = roomRect.h > 0 ? clamp01((y - roomRect.y) / roomRect.h) : 0.5;

        try {
          await updateDoc(doc(db, "devices", id), {
            x: nx,
            y: ny,
            updatedAt: serverTimestamp(),
            updatedBy: getCurrentUserName(),
          });
        } catch {}

        return;
      }

      const contentW = stageW.value;
      const contentH = stageH.value;

      const ax = contentW * marginX.value;
      const aw = contentW * (1 - marginX.value * 2);

      const ay = contentH * marginTop.value;
      const ah = contentH * (1 - marginTop.value - marginBottom.value);

      const nx = aw > 0 ? clamp01((x - ax) / aw) : 0.5;
      const ny = ah > 0 ? clamp01((y - ay) / ah) : 0.5;

      try {
        await updateDoc(doc(db, "devices", id), {
          x: nx,
          y: ny,
          updatedAt: serverTimestamp(),
          updatedBy: getCurrentUserName(),
        });
      } catch {}
    },
    [savedById]
  );

  const applyPlacedLocal = (id: string, x: number, y: number) => {
    const roomRect = getRoomRectContent();

    let nx = 0.5;
    let ny = 0.5;

    if (roomRect) {
      nx = roomRect.w > 0 ? clamp01((x - roomRect.x) / roomRect.w) : 0.5;
      ny = roomRect.h > 0 ? clamp01((y - roomRect.y) / roomRect.h) : 0.5;
    } else {
      const contentW = stageW.value;
      const contentH = stageH.value;

      const ax = contentW * marginX.value;
      const aw = contentW * (1 - marginX.value * 2);

      const ay = contentH * marginTop.value;
      const ah = contentH * (1 - marginTop.value - marginBottom.value);

      nx = aw > 0 ? clamp01((x - ax) / aw) : 0.5;
      ny = ah > 0 ? clamp01((y - ay) / ah) : 0.5;
    }

    setPlaced((prev: PlacedDevice[]) => prev.map((p) => (p.id === id ? { ...p, x, y, nx, ny } : p)));

    if (!savedById[id]) {
      const t = placedRef.current.find((p) => p.id === id)?.type ?? "camera";
      pendingPlacedRef.current[id] = { id, type: t, x, y, nx, ny };
    }
  };

  const dragStartX = useSharedValue(0);
  const dragStartY = useSharedValue(0);

  const lastX = useSharedValue(0);
  const lastY = useSharedValue(0);

  const onPlacedDragEnd = (id: string, x: number, y: number) => {
    if (savedById[id]) {
      saveActivePosition(id, x, y);
    } else {
      const roomRect = getRoomRectContent();

      let nx = 0.5;
      let ny = 0.5;

      if (roomRect) {
        nx = roomRect.w > 0 ? clamp01((x - roomRect.x) / roomRect.w) : 0.5;
        ny = roomRect.h > 0 ? clamp01((y - roomRect.y) / roomRect.h) : 0.5;
      } else {
        const contentW = stageW.value;
        const contentH = stageH.value;

        const ax = contentW * marginX.value;
        const aw = contentW * (1 - marginX.value * 2);

        const ay = contentH * marginTop.value;
        const ah = contentH * (1 - marginTop.value - marginBottom.value);

        nx = aw > 0 ? clamp01((x - ax) / aw) : 0.5;
        ny = ah > 0 ? clamp01((y - ay) / ah) : 0.5;
      }

      const t = placedRef.current.find((pp) => pp.id === id)?.type ?? "camera";
      pendingPlacedRef.current[id] = { id, type: t, x, y, nx, ny };
    }
  };

  const makeToolGesture = (deviceId: string, type: DeviceType) =>
    Gesture.Pan()
      .activateAfterLongPress(250)
      .onBegin((e) => {
        runOnJS(scheduleDrag)({ id: deviceId, type, x: e.absoluteX - stageBox.x, y: e.absoluteY - stageBox.y });
      })
      .onUpdate((e) => {
        runOnJS(scheduleDrag)({ id: deviceId, type, x: e.absoluteX - stageBox.x, y: e.absoluteY - stageBox.y });
      })
      .onEnd((e) => {
        runOnJS(scheduleDrag)(null);
        runOnJS(placeIfInside)(deviceId, type, e.absoluteX, e.absoluteY);
      })
      .onFinalize(() => {
        runOnJS(scheduleDrag)(null);
      });

  const makePlacedGesture = (id: string, startX: number, startY: number, type: DeviceType) =>
    Gesture.Pan()
      .runOnJS(true)
      .minDistance(6)
      .onStart(() => {
        dragStartX.value = startX;
        dragStartY.value = startY;
        lastX.value = startX;
        lastY.value = startY;

        placedDragX.value = startX;
        placedDragY.value = startY;

        setDraggingPlaced({ id, type });
      })
      .onUpdate((e) => {
        const nextX = dragStartX.value + e.translationX;
        const nextY = dragStartY.value + e.translationY;

        const roomRect = getRoomRectContent();

        if (roomRect) {
          const pad = MARKER_SIZE / 2;

          const minX = roomRect.x + pad;
          const maxX = roomRect.x + roomRect.w - pad;
          const minY = roomRect.y + pad;
          const maxY = roomRect.y + roomRect.h - pad;

          const clampedX = Math.min(Math.max(minX, nextX), maxX);
          const clampedY = Math.min(Math.max(minY, nextY), maxY);

          lastX.value = clampedX;
          lastY.value = clampedY;

          placedDragX.value = clampedX;
          placedDragY.value = clampedY;
          return;
        }

        const contentW = stageW.value;
        const contentH = stageH.value;

        const ax = contentW * marginX.value;
        const aw = contentW * (1 - marginX.value * 2);

        const ay = contentH * marginTop.value;
        const ah = contentH * (1 - marginTop.value - marginBottom.value);

        const isMeetingRoom = rid.includes("meeting");
        const isStairs = rid.includes("stairs");
        const isCorridor = rid.includes("corridor");
        const isRestroom = rid.includes("restroom") || rid === "wc";

        const minX = ax + (isRestroom ? RESTROOM_PAD_LEFT : 0);
        const maxX =
          ax +
          aw -
          (isMeetingRoom ? MEETING_RIGHT_SAFE_PAD : 0) -
          (isStairs ? STAIRS_RIGHT_SAFE_PAD : 0) -
          (isRestroom ? RESTROOM_PAD_RIGHT : 0);

        const minY = ay + (isRestroom ? RESTROOM_PAD_TOP : 0);
        const maxY =
          ay +
          ah -
          (isStairs ? STAIRS_BOTTOM_SAFE_PAD : 0) -
          (isCorridor ? CORRIDOR_BOTTOM_SAFE_PAD : 0) -
          (isRestroom ? RESTROOM_PAD_BOTTOM : 0);

        const clampedX = Math.min(Math.max(minX, nextX), maxX);
        const clampedY = Math.min(Math.max(minY, nextY), maxY);

        lastX.value = clampedX;
        lastY.value = clampedY;

        placedDragX.value = clampedX;
        placedDragY.value = clampedY;
      })
      .onEnd(() => {
        setDraggingPlaced(null);

        applyPlacedLocal(id, lastX.value, lastY.value);
        onPlacedDragEnd(id, lastX.value, lastY.value);
      })
      .onFinalize(() => {
        setDraggingPlaced(null);
      });

  const makePlacedTapGesture = (id: string, openDetailsById: (id: string) => void) =>
    Gesture.Tap()
      .runOnJS(true)
      .maxDistance(10)
      .onEnd((_e, success) => {
        if (success) openDetailsById(id);
      });

  const makePlacedCombinedGesture = (
    id: string,
    startX: number,
    startY: number,
    type: DeviceType,
    openDetailsById: (id: string) => void
  ) => Gesture.Exclusive(makePlacedGesture(id, startX, startY, type), makePlacedTapGesture(id, openDetailsById));

  const placedGhostStyle = useAnimatedStyle(() => {
    return {
      left: placedDragX.value - MARKER_SIZE / 2,
      top: placedDragY.value - MARKER_SIZE / 2,
    };
  });

  return {
    drag,
    scheduleDrag,

    makeToolGesture,
    makePlacedCombinedGesture,

    placedGhostStyle,
    placedDragX,
    placedDragY,

    onSaveAll,
  };
};
