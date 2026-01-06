import React from "react";
import Svg, { G, Rect, Text } from "react-native-svg";

type Props = {
  onRoomPress?: (id: string) => void;
};

export const FLOOR3_ZOOM_MAP: Record<string, { x: number; y: number; s: number }> = {
  "meeting-a": { x: 190,  y: -350, s: 2.2 },
  "meeting-b": { x: 190,  y:  350, s: 2.2 },
  "office-101": { x: -190, y: -365, s: 2.2 },
  "office-102": { x: -190, y:   -5, s: 2.2 },
  "office-103": { x: -190, y:  360, s: 2.2 },
  restroom: { x:  -20, y: -460, s: 2.4 },
  stairs:   { x:  -20, y:  460, s: 2.4 },
};


export default function Floor3Svg({ onRoomPress }: Props) {
  return (
    <Svg viewBox="0 0 760 1160" width="100%" height="100%">
      
      {/* حدود الطابق */}
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

      {/* الممر */}
      <G id="corridor">
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
          x={405}
          y={580}
          textAnchor="middle"
        >
          Corridor
        </Text>
      </G>

      {/* Meeting Room E */}
      <G id="meeting-e" onPress={() => onRoomPress?.("meeting-e")}>
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
          Meeting Room E
        </Text>
        <Rect fill="#1a1f36" x={320} y={626} width={20} height={24} />
      </G>

      {/* Meeting Room F */}
      <G id="meeting-f" onPress={() => onRoomPress?.("meeting-f")}>
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
          Meeting Room F
        </Text>
        <Rect fill="#1a1f36" x={320} y={506} width={20} height={24} />
      </G>

      {/* Room 301 */}
      <G id="office-301" onPress={() => onRoomPress?.("office-301")}>
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
          Room 301
        </Text>
        <Rect fill="#1a1f36" x={440} y={786} width={20} height={24} />
      </G>

      {/* Room 302 */}
      <G id="office-302" onPress={() => onRoomPress?.("office-302")}>
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
          Room 302
        </Text>
        <Rect fill="#1a1f36" x={440} y={726} width={20} height={24} />
      </G>

      {/* Room 303 */}
      <G id="office-303" onPress={() => onRoomPress?.("office-303")}>
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
          Room 303
        </Text>
        <Rect fill="#1a1f36" x={440} y={366} width={20} height={24} />
      </G>

      {/* WC */}
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

      {/* Stairs */}
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
    </Svg>
  );
}
