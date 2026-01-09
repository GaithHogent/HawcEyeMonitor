// src/navigators/AppStackNavigator.tsx
import { createStackNavigator } from "@react-navigation/stack";
import type { AppStackParamsList } from "./types";
import DashboardScreen from "../screens/DashboardScreen";
import DeviceDetailScreen from "../screens/devices/DeviceDetailScreen";
import TicketDetailScreen from "../screens/TicketDetailScreen";
import FullFloorMapScreen from "../screens/FullFloorMapScreen";

const Stack = createStackNavigator<AppStackParamsList>();

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
