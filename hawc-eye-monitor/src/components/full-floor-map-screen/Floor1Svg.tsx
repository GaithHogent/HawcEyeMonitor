// src/components/full-floor-map-screen/Floor1Svg.tsx
import React, { useMemo } from "react";
import Svg, { G, Rect, Text } from "react-native-svg";

type Props = {
  onRoomPress?: (id: string) => void;
  onlyRoomId?: string;
};

type RoomDef = {
  id: string;
  label: string;
  fill: string;
  rect: { x: number; y: number; w: number; h: number; rx?: number };
  labelPos?: { x: number; y: number; anchor?: "start" | "middle" | "end" };
  door?: { x: number; y: number; w: number; h: number };
};

// ===== ViewBox config =====
export const FLOOR1_VB_PADDING = 80;
export const FLOOR1_VB_MIN_W = 300;
export const FLOOR1_VB_MIN_H = 300;

const FLOOR_W = 760;
const FLOOR_H = 1160;

// ===== Rooms definition (نفس إحداثياتك) =====
export const ROOMS: RoomDef[] = [
  {
    id: "corridor",
    label: "Corridor",
    fill: "#eef2f7",
    rect: { x: 340, y: 40, w: 120, h: 1080, rx: 6 },
    labelPos: { x: 405, y: 580, anchor: "middle" },
  },
  {
    id: "meeting-a",
    label: "Meeting Room A",
    fill: "#f9fbff",
    rect: { x: 60, y: 600, w: 260, h: 520, rx: 8 },
    labelPos: { x: 190, y: 860, anchor: "middle" },
    door: { x: 320, y: 626, w: 20, h: 24 },
  },
  {
    id: "meeting-b",
    label: "Meeting Room B",
    fill: "#f9fbff",
    rect: { x: 60, y: 40, w: 260, h: 520, rx: 8 },
    labelPos: { x: 190, y: 300, anchor: "middle" },
    door: { x: 320, y: 506, w: 20, h: 24 },
  },
  {
    id: "office-101",
    label: "Room 101",
    fill: "#f9fbff",
    rect: { x: 460, y: 770, w: 220, h: 350, rx: 8 },
    labelPos: { x: 570, y: 960, anchor: "middle" },
    door: { x: 440, y: 786, w: 20, h: 24 },
  },
  {
    id: "office-102",
    label: "Room 102",
    fill: "#f9fbff",
    rect: { x: 460, y: 410, w: 220, h: 350, rx: 8 },
    labelPos: { x: 570, y: 600, anchor: "middle" },
    door: { x: 440, y: 726, w: 20, h: 24 },
  },
  {
    id: "office-103",
    label: "Room 103",
    fill: "#f9fbff",
    rect: { x: 460, y: 40, w: 220, h: 360, rx: 8 },
    labelPos: { x: 570, y: 240, anchor: "middle" },
    door: { x: 440, y: 366, w: 20, h: 24 },
  },
  {
    id: "restroom",
    label: "WC",
    fill: "#f7f0e6",
    rect: { x: 340, y: 960, w: 120, h: 160, rx: 6 },
    labelPos: { x: 405, y: 1040, anchor: "middle" },
    door: { x: 430, y: 936, w: 20, h: 24 },
  },
  {
    id: "stairs",
    label: "Stairs",
    fill: "#dde6f7",
    rect: { x: 340, y: 40, w: 120, h: 160, rx: 6 },
    labelPos: { x: 405, y: 120, anchor: "middle" },
  },
];

// ===== Export bounds for clamping devices inside rooms =====
export const FLOOR1_BOUNDS: Record<string, { x: number; y: number; w: number; h: number }> = ROOMS.reduce(
  (acc, r) => {
    acc[r.id] = { x: r.rect.x, y: r.rect.y, w: r.rect.w, h: r.rect.h };
    return acc;
  },
  {} as Record<string, { x: number; y: number; w: number; h: number }>
);

export default function Floor1Svg({ onRoomPress, onlyRoomId }: Props) {
  const showAll = !onlyRoomId;
  const show = (id: string) => showAll || onlyRoomId === id;

  const vb = useMemo(() => {
    if (onlyRoomId && FLOOR1_BOUNDS[onlyRoomId]) {
      const b = FLOOR1_BOUNDS[onlyRoomId];
      const pad = FLOOR1_VB_PADDING;

      const minX = Math.max(0, b.x - pad);
      const minY = Math.max(0, b.y - pad);

      const w = Math.max(b.w + pad * 2, FLOOR1_VB_MIN_W);
      const h = Math.max(b.h + pad * 2, FLOOR1_VB_MIN_H);

      return `${minX} ${minY} ${w} ${h}`;
    }

    return `0 0 ${FLOOR_W} ${FLOOR_H}`;
  }, [onlyRoomId]);

  return (
    <Svg viewBox={vb} width="100%" height="100%" preserveAspectRatio="none">
      {/* حدود الطابق (نخفيه عند عرض غرفة واحدة) */}
      {showAll && (
        <Rect
          id="boundary"
          fill="#f9fbff"
          stroke="#1a1f36"
          strokeWidth={2}
          x={0}
          y={0}
          width={FLOOR_W}
          height={FLOOR_H}
        />
      )}

      {ROOMS.map((r) => {
        if (!show(r.id)) return null;

        const { x, y, w, h, rx } = r.rect;

        return (
  <G key={r.id} id={r.id} onPress={() => onRoomPress?.(r.id)}>
    <Rect
      fill={r.fill}
      stroke="#1a1f36"
      strokeWidth={2}
      x={x}
      y={y}
      width={w}
      height={h}
      rx={rx ?? 0}
    />

    {showAll && (
      <Text
        fontFamily="Arial, Helvetica, sans-serif"
        fontSize={20}
        fill="#1a1f36"
        x={r.labelPos?.x ?? x + w / 2}
        y={r.labelPos?.y ?? y + h / 2}
        textAnchor={r.labelPos?.anchor ?? "middle"}
      >
        {r.label}
      </Text>
    )}

    {r.door && <Rect fill="#1a1f36" x={r.door.x} y={r.door.y} width={r.door.w} height={r.door.h} />}
  </G>
);

      })}
    </Svg>
  );
}
