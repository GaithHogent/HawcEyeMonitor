// src/types/deviceStatuses.ts

export type DeviceStatusKey = "active" | "inactive" | "issue";

export type DeviceStatusDef = {
  key: DeviceStatusKey;
  label: string;
};

export const DEVICE_STATUSES: DeviceStatusDef[] = [
  { key: "active", label: "Active" },
  { key: "inactive", label: "Inactive" },
  { key: "issue", label: "Issue" },
];
