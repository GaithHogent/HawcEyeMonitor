// src/types/device.ts
import type { Timestamp } from "firebase/firestore";
import type { DeviceStatusKey } from "./deviceStatuses";

export type DeviceStatus = DeviceStatusKey;

export type DeviceDoc = {
  name: string;        // سيُستخدم كـ "الوصف"
  type: string;        // مفتاح النوع
  status: DeviceStatus; // يُضبط تلقائيًا عند الإضافة

  floor?: number;
  roomId?: string;
  x?: number;
  y?: number;

  // issue fields (only when status === "issue")
  issueType?: string;
  issueDescription?: string;
  issueStartAt?: Timestamp;

  // audit fields (auto-generated)
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
  updatedBy?: string;
};

export type DeviceItem = DeviceDoc & { id: string };
