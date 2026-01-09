// src/navigators/DevicesStackNavigator.tsx

import { createStackNavigator } from "@react-navigation/stack";
import type { DevicesStackParamsList } from "./types";

// Screens
import DevicesListScreen from "../screens/devices/DevicesListScreen";
import DeviceDetailScreen from "../screens/devices/DeviceDetailScreen";
import DeviceFormScreen from "../screens/devices/DeviceFormScreen";

const Stack = createStackNavigator<DevicesStackParamsList>();

const DevicesStackNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerStatusBarHeight: 0, }}>
      <Stack.Screen
        name="DevicesList"
        component={DevicesListScreen}
        options={{
          headerShown: false,
          title: "Devices",
        }}
      />

      <Stack.Screen
        name="DeviceDetail"
        component={DeviceDetailScreen}
        options={({ route }) => ({
          title: route.params?.device?.name ? String(route.params.device.name) : "Device",
        })}
      />

      <Stack.Screen
        name="DeviceForm"
        component={DeviceFormScreen}
        options={({ route }) => ({
          title: route.params?.device ? "Edit Device" : "Add Device",
        })}
      />
    </Stack.Navigator>
  );
}
export default DevicesStackNavigator;
