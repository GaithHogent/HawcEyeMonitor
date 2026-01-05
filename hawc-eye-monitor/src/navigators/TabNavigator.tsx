// src/navigators/HawcTabNavigator.tsx
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import type { TabParamsList } from "./types";

import DashboardStackNavigator from "./AppStackNavigator";
import MapStackNavigator from "./MapStackNavigator";
import DevicesListScreen from "../screens/DevicesListScreen";
import AlertsCenterScreen from "../screens/AlertsCenterScreen";
import SettingsScreen from "../screens/SettingsScreen";
import { SafeAreaView } from "react-native-safe-area-context";

const Tab = createBottomTabNavigator<TabParamsList>();
const PRIMARY = "#0d7ff2";

export default function TabNavigator() {
  return (
    <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: PRIMARY,
        tabBarHideOnKeyboard: true,
      }}
    >
      <Tab.Screen
        name="Home"
        component={DashboardStackNavigator}
        options={{
          tabBarLabel: "Dashboard",
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="view-dashboard" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Map"
        component={MapStackNavigator}
        options={{
          tabBarLabel: "Map",
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="map" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Devices"
        component={DevicesListScreen}
        options={{
          tabBarLabel: "Devices",
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="access-point" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Alerts"
        component={AlertsCenterScreen}
        options={{
          tabBarLabel: "Alerts",
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="alert-decagram" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          tabBarLabel: "Settings",
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="cog" color={color} size={size} />
          ),
        }}
      />
    </Tab.Navigator>
    </SafeAreaView>
  );
}
