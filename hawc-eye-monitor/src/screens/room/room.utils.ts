import type { DeviceType } from "./useRoomTypes";

export const clamp01 = (n: number) => Math.max(0, Math.min(1, n));

export const mapToDeviceType = (t: string): DeviceType => {
  const x = (t ?? "").toLowerCase().trim();
  if (x === "fire") return "alarm";
  if (x === "motion") return "camera";
  if (x === "camera") return "camera";
  if (x === "sprinkler") return "sprinkler";
  if (x === "access") return "access";
  return "camera";
};
