// src/services/devices.service.ts
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  deleteField,
} from "firebase/firestore";
import { db, auth } from "../config/firebase";
import type { DeviceDoc, DeviceItem } from "../types/device";

const DEVICES_COL = "devices";

const getCurrentUserName = () => {
  return auth.currentUser?.displayName || auth.currentUser?.email || "system";
};

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
  const ref = await addDoc(collection(db, DEVICES_COL), {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    updatedBy: getCurrentUserName(),
  });
  return ref.id;
};

export const updateDevice = async (id: string, data: Partial<DeviceDoc>) => {
  await setDoc(
    doc(db, DEVICES_COL, id),
    {
      ...data,
      updatedAt: serverTimestamp(),
      updatedBy: getCurrentUserName(),
    },
    { merge: true }
  );
};

export const removeDevice = async (id: string) => {
  await deleteDoc(doc(db, DEVICES_COL, id));
};

// NEW: subscribe to a single device (live updates)
export const subscribeDevice = (
  id: string,
  onChange: (item: DeviceItem | null) => void
) => {
  const ref = doc(db, DEVICES_COL, id);
  return onSnapshot(ref, (snap) => {
    if (!snap.exists()) {
      onChange(null);
      return;
    }
    onChange({ id: snap.id, ...(snap.data() as DeviceDoc) });
  });
};

export const resolveDeviceIssue = async (id: string) => {
  await setDoc(
    doc(db, DEVICES_COL, id),
    {
      status: "active",
      issueType: deleteField(),
      issueDescription: deleteField(),
      issueStartAt: deleteField(),
      resolvedBefore: true,
      resolvedAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      updatedBy: getCurrentUserName(),
    },
    { merge: true }
  );
};

export const reportDeviceIssue = async (
  id: string,
  issueType: string,
  issueDescription: string
) => {
  await setDoc(
    doc(db, DEVICES_COL, id),
    {
      status: "issue",
      issueType,
      issueDescription,
      issueStartAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      updatedBy: getCurrentUserName(),
    },
    { merge: true }
  );
};

