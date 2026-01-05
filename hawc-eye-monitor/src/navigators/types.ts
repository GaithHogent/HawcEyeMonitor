// src/navigators/types.ts
import type { StackScreenProps } from '@react-navigation/stack';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';

// =============================================================================
// Auth Stack
export type AuthStackParamList = {
  Login: undefined;
  Register: { email?: string } | undefined;
};

export type AuthStackNavProps<T extends keyof AuthStackParamList> =
  StackScreenProps<AuthStackParamList, T>;
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
// Map Stack
  export type MapStackParamsList = {
    FloorsOverview: undefined;
    FullFloorMap: { floorId: string; svgPath: any };
  };
  export type MapStackNavProps<T extends keyof MapStackParamsList> =
  StackScreenProps<MapStackParamsList, T>;
// =============================================================================
// React Navigation Global Param List
declare global {
  namespace ReactNavigation {
    interface RootParamList
      extends AppStackParamsList,
        AuthStackParamList,
        MapStackParamsList,
      TabParamsList { }
  }
}