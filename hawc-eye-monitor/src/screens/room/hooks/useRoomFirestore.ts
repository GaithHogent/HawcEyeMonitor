import { useEffect, useRef, useState } from "react";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { db } from "../../../config/firebase";

import type { DeviceType, FsDeviceInfo, PlacedDevice, ToolbarDevice } from "../useRoomTypes";
import { clamp01, mapToDeviceType } from "../room.utils";

type Args = {
  roomId: string;
  floorId: string;

  stageBox: { x: number; y: number; w: number; h: number };

  getRoomRectContent: () => { x: number; y: number; w: number; h: number } | null;
  pxFromNorm: (nx: number, ny: number) => { x: number; y: number; nx: number; ny: number } | null;
};

export const useRoomFirestore = ({ roomId, floorId, stageBox, getRoomRectContent, pxFromNorm }: Args) => {
  const [placed, setPlaced] = useState<PlacedDevice[]>([]);
  const placedRef = useRef<PlacedDevice[]>([]);
  useEffect(() => {
    placedRef.current = placed;
  }, [placed]);

  const [toolbarDevices, setToolbarDevices] = useState<ToolbarDevice[]>([]);
  const [devicesById, setDevicesById] = useState<Record<string, FsDeviceInfo>>({});
  const [savedById, setSavedById] = useState<Record<string, { x: number; y: number }>>({});

  const [pendingIds, setPendingIds] = useState<Set<string>>(new Set());
  const pendingIdsRef = useRef<Set<string>>(new Set());
  useEffect(() => {
    pendingIdsRef.current = pendingIds;
  }, [pendingIds]);

  const pendingPlacedRef = useRef<Record<string, PlacedDevice>>({});

  // ===== Firestore: كل الأجهزة (للشريط + الاسم/النوع) =====
  useEffect(() => {
    const qAll = query(collection(db, "devices"));

    const unsubAll = onSnapshot(qAll, (snap) => {
      const toolbar: ToolbarDevice[] = [];
      const map: Record<string, FsDeviceInfo> = {};

      snap.forEach((docSnap) => {
        const d: any = docSnap.data();
        const name = d?.name ? String(d.name) : undefined;
        const typeRaw = d?.type ? String(d.type) : undefined;

        const status = String(d?.status ?? "").toLowerCase().trim();

        map[docSnap.id] = { name, typeRaw, status };

        if (status !== "inactive") return;

        const type = mapToDeviceType(typeRaw ?? "");
        toolbar.push({ id: docSnap.id, type, name, status });
      });

      setDevicesById(map);
      setToolbarDevices(toolbar);
    });

    return () => unsubAll();
  }, []);

  // ===== Firestore: الأجهزة الأكتيف داخل هالغرفة (حتى تبقى ثابتة) =====
  useEffect(() => {
    const qRoom = query(collection(db, "devices"), where("status", "in", ["active", "issue"]), where("roomId", "==", roomId));

    const unsubRoom = onSnapshot(qRoom, (snap) => {
      const fsMap: Record<string, PlacedDevice> = {};
      const nextSaved: Record<string, { x: number; y: number }> = {};

      const roomRect = getRoomRectContent();

      snap.forEach((docSnap) => {
        const d: any = docSnap.data();
        const xVal = d?.x;
        const yVal = d?.y;
        if (typeof xVal !== "number" || typeof yVal !== "number") return;

        let nx = xVal;
        let ny = yVal;

        const looksNormalized = xVal >= 0 && xVal <= 1 && yVal >= 0 && yVal <= 1;

        if (!looksNormalized && roomRect) {
          nx = roomRect.w > 0 ? clamp01((xVal - roomRect.x) / roomRect.w) : 0.5;
          ny = roomRect.h > 0 ? clamp01((yVal - roomRect.y) / roomRect.h) : 0.5;
        }

        const pos = pxFromNorm(nx, ny);
        if (!pos) return;

        nextSaved[docSnap.id] = { x: nx, y: ny };

        const typeRaw = d?.type ? String(d.type) : "";
        const type: DeviceType = mapToDeviceType(typeRaw);

        fsMap[docSnap.id] = { id: docSnap.id, type, x: pos.x, y: pos.y, nx: pos.nx, ny: pos.ny };
      });

      setSavedById(nextSaved);

      setPlaced(() => {
        const pendingLocal = Object.values(pendingPlacedRef.current).filter((p) => !fsMap[p.id]);
        return [...Object.values(fsMap), ...pendingLocal];
      });

      setPendingIds((prev) => {
        const next = new Set(prev);
        next.forEach((id) => {
          if (nextSaved[id]) {
            next.delete(id);
            delete pendingPlacedRef.current[id];
          }
        });
        pendingIdsRef.current = next;
        return next;
      });
    });

    return () => unsubRoom();
  }, [roomId, floorId, stageBox.x, stageBox.y, stageBox.w, stageBox.h]);

  return {
    placed,
    setPlaced,
    placedRef,

    toolbarDevices,
    devicesById,

    savedById,
    setSavedById,

    pendingIds,
    setPendingIds,
    pendingIdsRef,
    pendingPlacedRef,
  };
};
