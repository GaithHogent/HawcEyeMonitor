// src/types/device.ts
import type { Timestamp } from "firebase/firestore";

export type DeviceStatus = "active" | "inactive" | "issue";

export type DeviceDoc = {
  name: string;
  type: string;
  description?: string;
  status: DeviceStatus;

  floor?: number;
  roomId?: string;
  x?: number;
  y?: number;

  // issue fields (only when status === "issue")
  issueType?: string;
  issueDescription?: string;
  issueStartAt?: Timestamp;
};

export type DeviceItem = DeviceDoc & { id: string };
