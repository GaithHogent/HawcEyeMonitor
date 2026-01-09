// src/navigators/MapStackNavigator.tsx
import { createStackNavigator } from "@react-navigation/stack";
import type { MapStackParamsList } from "./types";

// Screens
import FloorsOverviewScreen from "../screens/FloorsOverviewScreen";
import FullFloorMapScreen from "../screens/FullFloorMapScreen";
import RoomScreen from "../screens/RoomScreen";

const Stack = createStackNavigator<MapStackParamsList>();

const MapStackNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen
        name="FloorsOverview"
        component={FloorsOverviewScreen}
      />

      <Stack.Screen
        name="FullFloorMap"
        component={FullFloorMapScreen}
        options={({ route }) => ({
          headerShown: true,
          title: `Floor ${route.params.floorId}`,
        })}
      />
      <Stack.Screen
        name="Room"
        component={RoomScreen}
        options={({ route }) => ({
          headerShown: true,
          title: `${route.params.roomId}`,
        })}
      />
    </Stack.Navigator>
  );
}
export default MapStackNavigator;