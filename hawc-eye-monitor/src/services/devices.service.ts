// src/services/devices.service.ts
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  updateDoc,
} from "firebase/firestore";
import { db } from "../config/firebase";
import type { DeviceDoc, DeviceItem } from "../types/device";

const DEVICES_COL = "devices";

export const subscribeDevices = (onChange: (items: DeviceItem[]) => void) => {
  const q = query(collection(db, DEVICES_COL), orderBy("name", "asc"));
  return onSnapshot(q, (snap) => {
    const items: DeviceItem[] = snap.docs.map((d) => ({
      id: d.id,
      ...(d.data() as DeviceDoc),
    }));
    onChange(items);
  });
};

export const createDevice = async (data: DeviceDoc) => {
  const ref = await addDoc(collection(db, DEVICES_COL), data);
  return ref.id;
};

export const updateDevice = async (id: string, data: Partial<DeviceDoc>) => {
  await updateDoc(doc(db, DEVICES_COL, id), data);
};

export const removeDevice = async (id: string) => {
  await deleteDoc(doc(db, DEVICES_COL, id));
};
