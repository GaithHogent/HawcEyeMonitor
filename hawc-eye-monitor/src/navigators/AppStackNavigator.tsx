// src/navigators/AppStackNavigator.tsx
import { createStackNavigator } from "@react-navigation/stack";
import type { AppStackParamsList } from "./types";
import DashboardScreen from "../screens/DashboardScreen";
import DeviceDetailScreen from "../screens/devices/DeviceDetailScreen";
import TicketDetailScreen from "../screens/TicketDetailScreen";
import FullFloorMapScreen from "../screens/FullFloorMapScreen";

const Stack = createStackNavigator<AppStackParamsList>();

const DashboardStackNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{headerStatusBarHeight: 0, }}>
      <Stack.Screen name="Dashboard" component={DashboardScreen} options={{headerShown:false}} />
      <Stack.Screen
        name="DeviceDetail"
        component={DeviceDetailScreen}
        options={{ title: "Device" }}
      />
      <Stack.Screen
        name="TicketDetail"
        component={TicketDetailScreen}
        options={{ title: "Ticket" }}
      />
      <Stack.Screen
        name="FullFloorMap"
        component={FullFloorMapScreen}
        options={({ route }) => ({
          title: `Floor ${route.params.floorId}`,
        })}
      />
    </Stack.Navigator>
  );
}
export default DashboardStackNavigator;
