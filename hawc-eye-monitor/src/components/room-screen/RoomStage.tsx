// src/components/room-screen/RoomStage.tsx
import { View } from "react-native";
import Animated from "react-native-reanimated";
import { GestureDetector } from "react-native-gesture-handler";
import { JSX } from "react";

type DeviceType = "camera" | "alarm" | "sprinkler" | "access";
type PlacedDevice = { id: string; type: DeviceType; x: number; y: number; nx: number; ny: number };

type Props = {
  styles: any;
  stageRef: any;
  onStageLayout: () => void;

  content: JSX.Element;
  placed: PlacedDevice[];

  draggingPlaced: { id: string; type: DeviceType } | null;
  drag: { id: string; type: DeviceType; x: number; y: number } | null;

  MARKER_SIZE: number;

  makePlacedCombinedGesture: (id: string, startX: number, startY: number, type: DeviceType) => any;
  renderMarkerIcon: (deviceId: string, fallbackType: DeviceType, size: number) => JSX.Element;

  placedGhostStyle: any;
};

const RoomStage = ({
  styles,
  stageRef,
  onStageLayout,
  content,
  placed,
  draggingPlaced,
  drag,
  MARKER_SIZE,
  makePlacedCombinedGesture,
  renderMarkerIcon,
  placedGhostStyle,
}: Props) => {
  return (
    <View ref={stageRef} style={styles.stageWrap} onLayout={onStageLayout}>
      <Animated.View style={styles.stage}>
        <View style={styles.canvas}>
          {content}

          {placed.map((d) => {
            const isDraggingThis = draggingPlaced?.id === d.id;

            return (
              <GestureDetector key={d.id} gesture={makePlacedCombinedGesture(d.id, d.x, d.y, d.type)}>
                <View
                  style={[
                    styles.marker,
                    {
                      left: d.x - MARKER_SIZE / 2,
                      top: d.y - MARKER_SIZE / 2,
                      opacity: isDraggingThis ? 0 : 1,
                    },
                  ]}
                >
                  {renderMarkerIcon(d.id, d.type, 18)}
                </View>
              </GestureDetector>
            );
          })}

          {draggingPlaced && (
            <Animated.View pointerEvents="none" style={[styles.ghost, placedGhostStyle]}>
              {renderMarkerIcon(draggingPlaced.id, draggingPlaced.type, 18)}
            </Animated.View>
          )}
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
          {renderMarkerIcon(drag.id, drag.type, 18)}
        </View>
      )}
    </View>
  );
};

export default RoomStage;
