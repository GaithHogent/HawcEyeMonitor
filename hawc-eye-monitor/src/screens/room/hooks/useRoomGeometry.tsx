import { useEffect, useMemo, useState } from "react";
import { useSharedValue } from "react-native-reanimated";

import Floor1Svg, {
  FLOOR1_BOUNDS,
  FLOOR1_VB_PADDING,
  FLOOR1_VB_MIN_W,
  FLOOR1_VB_MIN_H,
} from "../../../components/full-floor-map-screen/Floor1Svg";

import Floor2Svg, {
  FLOOR2_BOUNDS,
  FLOOR2_VB_PADDING,
  FLOOR2_VB_MIN_W,
  FLOOR2_VB_MIN_H,
} from "../../../components/full-floor-map-screen/Floor2Svg";

import Floor3Svg, {
  FLOOR3_BOUNDS,
  FLOOR3_VB_PADDING,
  FLOOR3_VB_MIN_W,
  FLOOR3_VB_MIN_H,
} from "../../../components/full-floor-map-screen/Floor3Svg";

import type { FloorId, RoomId, RoomRect, StageBox } from "../useRoomTypes";
import { clamp01 } from "../room.utils";

type Args = {
  floorId: FloorId;
  roomId: RoomId;
  MARKER_SIZE: number;
};

const DEFAULT_MARGIN_X = 0.18; // يمين/يسار
const DEFAULT_MARGIN_TOP = 0.12; // فوق
const DEFAULT_MARGIN_BOTTOM = 0.18; // جوه

// ===== غرف اليمين (office-101/102/103) =====
const RIGHT_MARGIN_X = 0.2;
const RIGHT_MARGIN_TOP = 0.1;
const RIGHT_MARGIN_BOTTOM = 0.1;

export const useRoomGeometry = ({ floorId, roomId, MARKER_SIZE }: Args) => {
  const content = useMemo(() => {
    if (floorId === "1") return <Floor1Svg onlyRoomId={roomId} />;
    if (floorId === "2") return <Floor2Svg onlyRoomId={roomId} />;
    return <Floor3Svg onlyRoomId={roomId} />;
  }, [floorId, roomId]);

  const rid = (roomId ?? "").toLowerCase();

  const isRightRoom = rid === "office-101" || rid === "office-102" || rid === "office-103";

  let mx = DEFAULT_MARGIN_X;
  let mt = DEFAULT_MARGIN_TOP;
  let mb = DEFAULT_MARGIN_BOTTOM;

  if (isRightRoom) {
    mx = RIGHT_MARGIN_X;
    mt = RIGHT_MARGIN_TOP;
    mb = RIGHT_MARGIN_BOTTOM;
  }

  if (rid.includes("corridor")) {
    mx = 0.42;
    mt = 0.08;
    mb = 0.08;
  } else if (rid.includes("stairs")) {
    mx = 0.3;
    mt = 0.25;
    mb = 0.25;
  } else if (rid.includes("restroom") || rid === "wc") {
    mx = 0.34;
    mt = 0.22;
    mb = 0.22;
  }

  const marginX = useSharedValue(mx);
  const marginTop = useSharedValue(mt);
  const marginBottom = useSharedValue(mb);

  useEffect(() => {
    marginX.value = mx;
    marginTop.value = mt;
    marginBottom.value = mb;
  }, [mx, mt, mb]);

  // مساحة الـ stage
  const [stageBox, setStageBox] = useState<StageBox>({ x: 0, y: 0, w: 0, h: 0 });
  const stageW = useSharedValue(0);
  const stageH = useSharedValue(0);

  const getFloorRoomBounds = (f: FloorId, id: RoomId) => {
    if (f === "1") return FLOOR1_BOUNDS[id] ?? null;
    if (f === "2") return FLOOR2_BOUNDS[id] ?? null;
    if (f === "3") return FLOOR3_BOUNDS[id] ?? null;
    return null;
  };

  const getViewBoxForRoom = (f: FloorId, id: RoomId) => {
    if (f === "1") {
      const b = FLOOR1_BOUNDS[id];
      if (!b) return { x: 0, y: 0, w: 760, h: 1160 };

      const minX = Math.max(0, b.x - FLOOR1_VB_PADDING);
      const minY = Math.max(0, b.y - FLOOR1_VB_PADDING);

      const w = Math.max(b.w + FLOOR1_VB_PADDING * 2, FLOOR1_VB_MIN_W);
      const h = Math.max(b.h + FLOOR1_VB_PADDING * 2, FLOOR1_VB_MIN_H);

      return { x: minX, y: minY, w, h };
    }

    if (f === "2") {
      const b = FLOOR2_BOUNDS[id];
      if (!b) return { x: 0, y: 0, w: 760, h: 1160 };

      const minX = Math.max(0, b.x - FLOOR2_VB_PADDING);
      const minY = Math.max(0, b.y - FLOOR2_VB_PADDING);

      const w = Math.max(b.w + FLOOR2_VB_PADDING * 2, FLOOR2_VB_MIN_W);
      const h = Math.max(b.h + FLOOR2_VB_PADDING * 2, FLOOR2_VB_MIN_H);

      return { x: minX, y: minY, w, h };
    }

    if (f === "3") {
      const b = FLOOR3_BOUNDS[id];
      if (!b) return { x: 0, y: 0, w: 760, h: 1160 };

      const minX = Math.max(0, b.x - FLOOR3_VB_PADDING);
      const minY = Math.max(0, b.y - FLOOR3_VB_PADDING);

      const w = Math.max(b.w + FLOOR3_VB_PADDING * 2, FLOOR3_VB_MIN_W);
      const h = Math.max(b.h + FLOOR3_VB_PADDING * 2, FLOOR3_VB_MIN_H);

      return { x: minX, y: minY, w, h };
    }

    return { x: 0, y: 0, w: 760, h: 1160 };
  };

  const getRoomRectContent = (): RoomRect | null => {
    const contentW = stageW.value;
    const contentH = stageH.value;
    if (contentW <= 0 || contentH <= 0) return null;

    const b = getFloorRoomBounds(floorId, roomId);
    if (!b) return null;

    const vb = getViewBoxForRoom(floorId, roomId);

    const sx = contentW / vb.w;
    const sy = contentH / vb.h;

    const x = (b.x - vb.x) * sx;
    const y = (b.y - vb.y) * sy;
    const w = b.w * sx;
    const h = b.h * sy;

    return { x, y, w, h };
  };

  const clampToRoomByPx = (px: number, py: number) => {
    const r = getRoomRectContent();
    if (!r) return null;

    const pad = MARKER_SIZE / 2;

    const minX = r.x + pad;
    const maxX = r.x + r.w - pad;
    const minY = r.y + pad;
    const maxY = r.y + r.h - pad;

    const cx = Math.min(Math.max(minX, px), maxX);
    const cy = Math.min(Math.max(minY, py), maxY);

    const nx = r.w > 0 ? clamp01((cx - r.x) / r.w) : 0.5;
    const ny = r.h > 0 ? clamp01((cy - r.y) / r.h) : 0.5;

    return { x: cx, y: cy, nx, ny };
  };

  const pxFromNorm = (nx: number, ny: number) => {
    const r = getRoomRectContent();
    if (!r) return null;

    const x = r.x + r.w * clamp01(nx);
    const y = r.y + r.h * clamp01(ny);

    const clamped = clampToRoomByPx(x, y);
    if (!clamped) return null;

    return clamped;
  };

  return {
    content,
    rid,

    stageBox,
    setStageBox,
    stageW,
    stageH,

    marginX,
    marginTop,
    marginBottom,

    getRoomRectContent,
    clampToRoomByPx,
    pxFromNorm,
  };
};
