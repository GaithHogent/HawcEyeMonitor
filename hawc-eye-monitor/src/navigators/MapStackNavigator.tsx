// src/navigators/MapStackNavigator.tsx
import { createStackNavigator } from "@react-navigation/stack";
import type { MapStackParamsList } from "./types";

// Screens
import FloorsOverviewScreen from "../screens/FloorsOverviewScreen";
import FullFloorMapScreen from "../screens/FullFloorMapScreen";
import RoomScreen from "../screens/RoomScreen";

import { FLOOR1_ROOM_LABELS } from "../components/full-floor-map-screen/Floor1Svg";
import { FLOOR2_ROOM_LABELS } from "../components/full-floor-map-screen/Floor2Svg";
import { FLOOR3_ROOM_LABELS } from "../components/full-floor-map-screen/Floor3Svg";

const Stack = createStackNavigator<MapStackParamsList>();

const MapStackNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerStatusBarHeight: 0 }}>
      <Stack.Screen
        name="FloorsOverview"
        component={FloorsOverviewScreen}
        options={{headerShown: false}}
      />

      <Stack.Screen
        name="FullFloorMap"
        component={FullFloorMapScreen}
        options={({ route }) => ({
          title: `Floor ${route.params.floorId}`,
        })}
      />
      <Stack.Screen
        name="Room"
        component={RoomScreen}
        options={({ route }) => {
          const floorId = String((route.params as any)?.floorId ?? "");
          const roomId = String((route.params as any)?.roomId ?? "");

          const label =
            floorId === "1"
              ? FLOOR1_ROOM_LABELS[roomId]
              : floorId === "2"
                ? FLOOR2_ROOM_LABELS[roomId]
                : FLOOR3_ROOM_LABELS[roomId];

          return {
            title: label ? String(label) : `${roomId}`,
          };
        }}
      />
    </Stack.Navigator>
  );
}
export default MapStackNavigator;
