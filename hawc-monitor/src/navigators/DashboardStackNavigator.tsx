// src/navigation/DashboardStackNavigator.tsx
import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import type { DashboardStackParams } from "./types";
import DashboardScreen from "../screens/DashboardScreen";
import DeviceDetailScreen from "../screens/DeviceDetailScreen";
import TicketDetailScreen from "../screens/TicketDetailScreen";
import FullFloorMapScreen from "../screens/FullFloorMapScreen";

const Stack = createStackNavigator<DashboardStackParams>();

export default function DashboardStackNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Dashboard" component={DashboardScreen} />
      <Stack.Screen
        name="DeviceDetail"
        component={DeviceDetailScreen}
        options={{ headerShown: true, title: "Device" }}
      />
      <Stack.Screen
        name="TicketDetail"
        component={TicketDetailScreen}
        options={{ headerShown: true, title: "Ticket" }}
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
