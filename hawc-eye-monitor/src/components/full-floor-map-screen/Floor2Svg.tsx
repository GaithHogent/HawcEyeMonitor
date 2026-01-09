import React from "react";
import Svg, { G, Rect, Text } from "react-native-svg";

type Props = {
  onRoomPress?: (id: string) => void;
  onlyRoomId?: string;
};

export default function Floor2Svg({ onRoomPress, onlyRoomId }: Props) {
  const showAll = !onlyRoomId;
  const show = (id: string) => showAll || onlyRoomId === id;

  // حدود كل غرفة (من القيم الموجودة في الـ Rects)
  const bounds: Record<string, { x: number; y: number; w: number; h: number }> = {
    "meeting-c": { x: 60,  y: 600, w: 260, h: 520 },
    "meeting-d": { x: 60,  y: 40,  w: 260, h: 520 },
    "office-201": { x: 440, y: 670, w: 220, h: 550 },
    "office-202": { x: 460, y: 410, w: 220, h: 350 },
    "office-203": { x: 460, y: 40,  w: 220, h: 360 },
    "restroom":   { x: 340, y: 860, w: 120, h: 360 },
    "stairs":     { x: 340, y: 40,  w: 120, h: 160 },
   "corridor": { x: 140, y: 100, w: 520, h: 1080 },

  };

  const padding = 80;

    const vb = onlyRoomId && bounds[onlyRoomId]
  ? (() => {
      const b = bounds[onlyRoomId];

      const minX = Math.max(0, b.x - padding);
      const minY = Math.max(0, b.y - padding);

      const minW = 300;
      const minH = 300;

      const w = Math.max(b.w + padding * 2, minW);
      const h = Math.max(b.h + padding * 2, minH);

      return `${minX} ${minY} ${w} ${h}`;
    })()
  : "0 0 760 1160";


  return (
    <Svg viewBox={vb} width="100%" height="100%">
      {/* حدود الطابق (نخفيه عند عرض عنصر واحد) */}
      {showAll && (
        <Rect
          id="boundary"
          fill="#f9fbff"
          stroke="#1a1f36"
          strokeWidth={2}
          x={0}
          y={0}
          width={760}
          height={1160}
        />
      )}

      {/* الممر */}
      {/* الممر */}
{/* الممر */}
{/* الممر */}
{(showAll || onlyRoomId === "corridor") && (
  <G id="corridor" onPress={() => onRoomPress?.("corridor")}>
    <Rect
      fill="#eef2f7"
      stroke="#1a1f36"
      strokeWidth={2}
      x={340}
      y={40}
      width={120}
      height={1080}
      rx={6}
    />
    <Text
      fontFamily="Arial, Helvetica, sans-serif"
      fontSize={20}
      fill="#1a1f36"
      x={340 + 120 / 2}
      y={40 + 1080 / 2}
      textAnchor="middle"
    >
      Corridor
    </Text>
  </G>
)}




      {/* Meeting Room C */}
      {show("meeting-c") && (
        <G id="meeting-c" onPress={() => onRoomPress?.("meeting-c")}>
          <Rect
            fill="#f9fbff"
            stroke="#1a1f36"
            strokeWidth={2}
            x={60}
            y={600}
            width={260}
            height={520}
            rx={8}
          />
          <Text
            fontFamily="Arial, Helvetica, sans-serif"
            fontSize={20}
            fill="#1a1f36"
            x={190}
            y={860}
            textAnchor="middle"
          >
            Meeting Room C
          </Text>
          <Rect fill="#1a1f36" x={320} y={626} width={20} height={24} />
        </G>
      )}

      {/* Meeting Room D */}
      {show("meeting-d") && (
        <G id="meeting-d" onPress={() => onRoomPress?.("meeting-d")}>
          <Rect
            fill="#f9fbff"
            stroke="#1a1f36"
            strokeWidth={2}
            x={60}
            y={40}
            width={260}
            height={520}
            rx={8}
          />
          <Text
            fontFamily="Arial, Helvetica, sans-serif"
            fontSize={20}
            fill="#1a1f36"
            x={190}
            y={300}
            textAnchor="middle"
          >
            Meeting Room D
          </Text>
          <Rect fill="#1a1f36" x={320} y={506} width={20} height={24} />
        </G>
      )}

      {/* Room 201 */}
      {show("office-201") && (
        <G id="office-201" onPress={() => onRoomPress?.("office-201")}>
          <Rect
            fill="#f9fbff"
            stroke="#1a1f36"
            strokeWidth={2}
            x={460}
            y={770}
            width={220}
            height={350}
            rx={8}
          />
          <Text
            fontFamily="Arial, Helvetica, sans-serif"
            fontSize={20}
            fill="#1a1f36"
            x={570}
            y={960}
            textAnchor="middle"
          >
            Room 201
          </Text>
          <Rect fill="#1a1f36" x={440} y={786} width={20} height={24} />
        </G>
      )}

      {/* Room 202 */}
      {show("office-202") && (
        <G id="office-202" onPress={() => onRoomPress?.("office-202")}>
          <Rect
            fill="#f9fbff"
            stroke="#1a1f36"
            strokeWidth={2}
            x={460}
            y={410}
            width={220}
            height={350}
            rx={8}
          />
          <Text
            fontFamily="Arial, Helvetica, sans-serif"
            fontSize={20}
            fill="#1a1f36"
            x={570}
            y={600}
            textAnchor="middle"
          >
            Room 202
          </Text>
          <Rect fill="#1a1f36" x={440} y={726} width={20} height={24} />
        </G>
      )}

      {/* Room 203 */}
      {show("office-203") && (
        <G id="office-203" onPress={() => onRoomPress?.("office-203")}>
          <Rect
            fill="#f9fbff"
            stroke="#1a1f36"
            strokeWidth={2}
            x={460}
            y={40}
            width={220}
            height={360}
            rx={8}
          />
          <Text
            fontFamily="Arial, Helvetica, sans-serif"
            fontSize={20}
            fill="#1a1f36"
            x={570}
            y={240}
            textAnchor="middle"
          >
            Room 203
          </Text>
          <Rect fill="#1a1f36" x={440} y={366} width={20} height={24} />
        </G>
      )}

      {/* WC */}
      {show("restroom") && (
        <G id="restroom" onPress={() => onRoomPress?.("restroom")}>
          <Rect
            fill="#f7f0e6"
            stroke="#1a1f36"
            strokeWidth={2}
            x={340}
            y={960}
            width={120}
            height={160}
            rx={6}
          />
          <Text
            fontFamily="Arial, Helvetica, sans-serif"
            fontSize={20}
            fill="#1a1f36"
            x={405}
            y={1040}
            textAnchor="middle"
          >
            WC
          </Text>
          <Rect fill="#1a1f36" x={430} y={936} width={20} height={24} />
        </G>
      )}

      {/* Stairs */}
      {show("stairs") && (
        <G id="stairs" onPress={() => onRoomPress?.("stairs")}>
          <Rect
            fill="#dde6f7"
            stroke="#1a1f36"
            strokeWidth={2}
            x={340}
            y={40}
            width={120}
            height={160}
            rx={6}
          />
          <Text
            fontFamily="Arial, Helvetica, sans-serif"
            fontSize={20}
            fill="#1a1f36"
            x={405}
            y={120}
            textAnchor="middle"
          >
            Stairs
          </Text>
        </G>
      )}
    </Svg>
  );
}
