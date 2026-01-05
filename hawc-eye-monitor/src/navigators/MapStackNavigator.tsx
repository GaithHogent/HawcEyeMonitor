// src/navigation/MapStackNavigator.tsx
import { createStackNavigator } from "@react-navigation/stack";
import type { MapStackParamsList } from "./types";

// Screens
import FloorsOverviewScreen from "../screens/FloorsOverviewScreen";
import FullFloorMapScreen from "../screens/FullFloorMapScreen";

const Stack = createStackNavigator<MapStackParamsList>();

export default function MapStackNavigator() {
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
    </Stack.Navigator>
  );
}
