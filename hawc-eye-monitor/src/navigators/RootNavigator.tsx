// src/navigators/RootNavigator.tsx
import { createStackNavigator } from "@react-navigation/stack";
import TabNavigator from "./TabNavigator";
import DeviceFormScreen from "../screens/devices/DeviceFormScreen";
import type { RootStackParamList } from "./types";

const Stack = createStackNavigator<RootStackParamList>();

const RootNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Tabs" component={TabNavigator} />

      <Stack.Screen
        name="DeviceFormModal"
        component={DeviceFormScreen}
        options={{
          presentation: "modal",
          headerShown: true,
          title: "Add Device",
        }}
      />
    </Stack.Navigator>
  );
}
export default RootNavigator;
