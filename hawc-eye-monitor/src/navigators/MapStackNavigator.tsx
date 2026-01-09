import { createStackNavigator } from "@react-navigation/stack";
import type { MapStackParamsList } from "./types";

// Screens
import FloorsOverviewScreen from "../screens/FloorsOverviewScreen";
import FullFloorMapScreen from "../screens/FullFloorMapScreen";
import RoomScreen from "../screens/RoomScreen";

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
        options={({ route }) => ({
          title: `${route.params.roomId}`,
        })}
      />
    </Stack.Navigator>
  );
}
export default MapStackNavigator;
