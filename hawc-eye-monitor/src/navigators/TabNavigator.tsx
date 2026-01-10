// src/navigators/TabNavigator.tsx
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import type { TabParamsList } from "./types";

import DashboardStackNavigator from "./AppStackNavigator";
import MapStackNavigator from "./MapStackNavigator";
import DevicesStackNavigator from "./DevicesStackNavigator";
import SettingsScreen from "../screens/SettingsScreen";
import { SafeAreaView } from "react-native-safe-area-context";
import { useEffect, useState } from "react";
import { subscribeDevices } from "../services/devices.service";

const Tab = createBottomTabNavigator<TabParamsList>();
const PRIMARY = "#0d7ff2";

const DevicesTab = () => <DevicesStackNavigator initialRouteName="DevicesList" />;

const AlertsTab = () => <DevicesStackNavigator initialRouteName="Alerts" />;

export default function TabNavigator() {
  const [alertsCount, setAlertsCount] = useState(0);

  useEffect(() => {
    const unsub = subscribeDevices((items) => {
      setAlertsCount(items.filter((d) => d.status === "issue").length);
    });
    return unsub;
  }, []);

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
        component={DevicesTab}
        options={{
          tabBarLabel: "Devices",
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="access-point" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Alerts"
        component={AlertsTab}
        options={{
          tabBarLabel: "Alerts",
          tabBarBadge: alertsCount > 0 ? alertsCount : undefined,
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
