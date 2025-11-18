// src/navigation/MapStackNavigator.tsx
import React from "react";
import { createStackNavigator } from "@react-navigation/stack";

// Screens
import FloorsOverviewScreen from "../screens/FloorsOverviewScreen";
import FullFloorMapScreen from "../screens/FullFloorMapScreen";

export type MapStackParams = {
  FloorsOverview: undefined;
  FullFloorMap: { floorId: string; svgPath: any };
};

const Stack = createStackNavigator<MapStackParams>();

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
