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
  getDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import { db, auth } from "../config/firebase";
import type { DeviceDoc, DeviceItem } from "../types/device";

const DEVICES_COL = "devices";
const USERS_COL = "users";

const getCurrentUserName = () => {
  return auth.currentUser?.displayName || auth.currentUser?.email || "system";
};

let devicesCache: DeviceItem[] | null = null;

export const getCachedDevices = () => {
  return devicesCache;
};

export const subscribeDevices = (onChange: (items: DeviceItem[]) => void) => {
  const q = query(collection(db, DEVICES_COL), orderBy("name", "asc"));
  return onSnapshot(q, (snap) => {
    const items: DeviceItem[] = snap.docs.map((d) => ({
      id: d.id,
      ...(d.data() as DeviceDoc),
    }));
    devicesCache = items;
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
  const ref = doc(db, DEVICES_COL, id);
  const snap = await getDoc(ref);
  const data: any = snap.exists() ? snap.data() : null;

  const hasRoomId = !!data?.roomId;

  await setDoc(
    ref,
    {
      status: hasRoomId ? "active" : "inactive",
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

export const ensureUserProfile = async (uid: string, email: string) => {
  const ref = doc(db, USERS_COL, uid);
  const snap = await getDoc(ref);

  if (!snap.exists()) {
    await setDoc(
      ref,
      {
        email,
        role: "staff",
        accessStatus: "pending",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
  }
};

export const createUserProfile = async (uid: string, email: string) => {
  await setDoc(
    doc(db, USERS_COL, uid),
    {
      email,
      role: "staff",
      accessStatus: "pending",
      createdAt: serverTimestamp(),
    },
    { merge: true }
  );
};

export const subscribeUserProfile = (
  uid: string,
  onChange: (profile: { role?: string; accessStatus?: string } | null) => void
) => {
  const ref = doc(db, USERS_COL, uid);
  return onSnapshot(ref, (s) => {
    if (!s.exists()) {
      onChange(null);
      return;
    }
    const d: any = s.data() ?? {};
    onChange({
      role: d?.role ? String(d.role) : undefined,
      accessStatus: d?.accessStatus ? String(d.accessStatus) : undefined,
    });
  });
};

type UserRow = {
  id: string;
  email?: string;
  role?: string;
  accessStatus?: "pending" | "approved" | "rejected" | string;
};

export const subscribeUsersByAccessStatus = (
  status: "pending" | "approved" | "rejected",
  onChange: (rows: UserRow[]) => void
) => {
  const col = collection(db, USERS_COL);
  const q = query(col, where("accessStatus", "==", status));

  return onSnapshot(q, (snap) => {
    const rows: UserRow[] = [];
    snap.forEach((d) => {
      const data: any = d.data();
      rows.push({
        id: d.id,
        email: data?.email ? String(data.email) : undefined,
        role: data?.role ? String(data.role) : undefined,
        accessStatus: data?.accessStatus ? String(data.accessStatus) : status,
      });
    });
    onChange(rows);
  });
};

export const subscribePendingUsersCount = (onChange: (count: number) => void) => {
  const qPending = query(collection(db, USERS_COL), where("accessStatus", "==", "pending"));
  return onSnapshot(qPending, (snap) => {
    onChange(snap.size);
  });
};

export const setUserAccessStatus = async (uid: string, nextStatus: "approved" | "rejected" | "pending") => {
  await updateDoc(doc(db, USERS_COL, uid), {
    accessStatus: nextStatus,
    updatedAt: serverTimestamp(),
  });
};
