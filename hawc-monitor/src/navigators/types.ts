// src/navigators/types.ts
import type { StackScreenProps } from '@react-navigation/stack';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';

// =============================================================================
// Tabs
export type TabParamsList = {
  Home: undefined;
  Map: undefined;
  Devices: undefined;
  Alerts: undefined;
  Settings: undefined;
};
export type TabsNavProps<T extends keyof TabParamsList> =
  BottomTabScreenProps<TabParamsList, T>;
// =============================================================================
// App Stack
export type AppStackParamsList = {
  Dashboard: undefined;
  DeviceDetail: { id: string };
  TicketDetail: { id: string };
  FullFloorMap: { floorId: string; svgPath: string };
};
export type AppStackNavProps<T extends keyof AppStackParamsList> =
  StackScreenProps<AppStackParamsList, T>;
// =============================================================================
// React Navigation Global Param List
declare global {
  namespace ReactNavigation {
    interface RootParamList
      extends AppStackParamsList,
      TabParamsList { }
  }
}