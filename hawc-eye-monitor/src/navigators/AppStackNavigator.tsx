// src/navigators/AppStackNavigator.tsx
import { createStackNavigator } from "@react-navigation/stack";
import type { AppStackParamsList } from "./types";
import DashboardScreen from "../screens/DashboardScreen";
import WebsiteScreen from "../screens/WebsiteScreen";

const Stack = createStackNavigator<AppStackParamsList>();

const DashboardStackNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{headerStatusBarHeight: 0, }}>
      <Stack.Screen name="Dashboard" component={DashboardScreen} options={{headerShown:false}} />
      <Stack.Screen name="Website" component={WebsiteScreen} options={{ title: "HAWC-Servers" }} />
    </Stack.Navigator>
  );
}
export default DashboardStackNavigator;
