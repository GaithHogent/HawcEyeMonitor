export type HawcTabParamsList = {
  Home: undefined;      // Dashboard stack
  Map: undefined;       // Floor map
  Devices: undefined;   // Devices list
  Alerts: undefined;    // Alerts center
  Settings: undefined;  // Settings
};

export type DashboardStackParams = {
  Dashboard: undefined;
  DeviceDetail: { id: string };
  TicketDetail: { id: string };
};
