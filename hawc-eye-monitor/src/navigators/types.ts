// src/navigators/types.ts
import type { StackScreenProps } from '@react-navigation/stack';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { DeviceItem } from "../types/device";

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
  Admin: undefined;
  Profile: undefined;
};
export type TabsNavProps<T extends keyof TabParamsList> =
  BottomTabScreenProps<TabParamsList, T>;
// =============================================================================
// App Stack
export type AppStackParamsList = {
  Dashboard: undefined;
  Website: undefined;
};
export type AppStackNavProps<T extends keyof AppStackParamsList> =
  StackScreenProps<AppStackParamsList, T>;
// =============================================================================
// Map Stack
  export type MapStackParamsList = {
    FloorsOverview: undefined;
    FullFloorMap: { floorId: string };
    Room: { floorId: string; roomId: string };
  };
  export type MapStackNavProps<T extends keyof MapStackParamsList> =
  StackScreenProps<MapStackParamsList, T>;
// =============================================================================
// Devices Stack
export type DevicesStackParamsList = {
  DevicesList: undefined;
  DeviceDetail: { device: DeviceItem };
  DeviceForm: { device: DeviceItem } | undefined;
  Alerts: undefined;
  ReportIssue: {
    deviceId: string;
    returnTo?: {
      tab: keyof TabParamsList;
      screen?: string;
      params?: any;
    };
  };
};
export type DevicesStackNavProps<T extends keyof DevicesStackParamsList> =
  StackScreenProps<DevicesStackParamsList, T>;
// ===================================================
// Root Stack
export type RootStackParamList = {
  Tabs: undefined;
  DeviceFormModal:
    | {
        deviceId?: string; 
        floorId?: string;
        roomId?: string;
        returnTo?: {
          tab: keyof TabParamsList;        
          screen?: string;                 
          params?: any;
        };
      }
    | undefined;
};
//TODO: لازم اشيل التعليق منا و اشوف وين لازم استعملها 

/*export type RootStackNavProps<T extends keyof RootStackParamList> =
  StackScreenProps<RootStackParamList, T>;*/
// =============================================================================
// React Navigation Global Param List
declare global {
  namespace ReactNavigation {
    interface RootParamList
      extends AppStackParamsList,
        AuthStackParamList,
        MapStackParamsList,
        DevicesStackParamsList,
      TabParamsList { }
  }
}
