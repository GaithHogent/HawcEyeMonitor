// src/navigators/MapStackNavigator.tsx
import { createStackNavigator } from "@react-navigation/stack";
import type { MapStackParamsList } from "./types";

// Screens
import FloorsOverviewScreen from "../screens/FloorsOverviewScreen";
import FullFloorMapScreen from "../screens/FullFloorMapScreen";
import RoomScreen from "../screens/RoomScreen";

import { ROOMS as FLOOR1_ROOMS } from "../components/full-floor-map-screen/Floor1Svg";
import { ROOMS as FLOOR2_ROOMS } from "../components/full-floor-map-screen/Floor2Svg";
import { ROOMS as FLOOR3_ROOMS } from "../components/full-floor-map-screen/Floor3Svg";

const Stack = createStackNavigator<MapStackParamsList>();

const getRoomLabel = (floorId: string, roomId: string) => {
  const rooms =
    floorId === "1"
      ? FLOOR1_ROOMS
      : floorId === "2"
      ? FLOOR2_ROOMS
      : FLOOR3_ROOMS;

  return rooms.find((r) => r.id === roomId)?.label ?? roomId;
};

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
        options={({ route }) => ({
          title: getRoomLabel(route.params.floorId, route.params.roomId),
        })}
      />
    </Stack.Navigator>
  );
}
export default MapStackNavigator;
