import { MaterialCommunityIcons } from "@expo/vector-icons";

export type DeviceTypeDef = {
  label: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
};

export const DEVICE_TYPES: DeviceTypeDef[] = [
  { label: "CCTV Camera", icon: "cctv" },
  { label: "Motion Sensor", icon: "motion-sensor" },
  { label: "Fire Sensor", icon: "fire-alert" },
  { label: "Alarm Device", icon: "alarm-light" },
  { label: "Display Screen", icon: "monitor" },
];
