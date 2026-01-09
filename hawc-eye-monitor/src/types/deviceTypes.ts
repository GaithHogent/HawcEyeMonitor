import { MaterialCommunityIcons } from "@expo/vector-icons";

export type DeviceTypeDef = {
  key: string;
  label: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
};

export const DEVICE_TYPES: DeviceTypeDef[] = [
  { key: "camera", label: "CCTV Camera", icon: "cctv" },
  { key: "motion", label: "Motion Sensor", icon: "motion-sensor" },
  { key: "fire", label: "Fire Sensor", icon: "fire-alert" },
  { key: "alarm", label: "Alarm Device", icon: "alarm-light" },
  { key: "display", label: "Display Screen", icon: "monitor" },
];
