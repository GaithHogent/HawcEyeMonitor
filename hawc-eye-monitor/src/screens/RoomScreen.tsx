import { useMemo, useState, useEffect, useRef } from "react";
import { View, Alert } from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import { useSharedValue} from "react-native-reanimated";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import { serverTimestamp, updateDoc, deleteField, doc } from "firebase/firestore";
import { db } from "../config/firebase";
import Button from "../components/Button";
import { DEVICE_TYPES } from "../types/deviceTypes";

import RoomToolbar from "../components/room-screen/RoomToolbar";
import RoomStage from "../components/room-screen/RoomStage";
import DeviceDetailsModal from "../components/room-screen/DeviceDetailsModal";
import { resolveDeviceIssue } from "../services/devices.service";

import { useRoomGeometry } from "./room/hooks/useRoomGeometry";
import { useRoomFirestore } from "./room/hooks/useRoomFirestore";
import { useRoomDragDrop } from "./room/hooks/useRoomDragDrop";

import type { DeviceType, PlacedDevice, FsDeviceInfo, FloorId, RoomId } from "./room/useRoomTypes";

type Params = { floorId: string; roomId: string };

const MARKER_SIZE = 28;

const RoomScreen = () => {
  const { params } = useRoute<any>();
  const { floorId, roomId } = params as Params;
  const navigation = useNavigation<any>();
  const stageRef = useRef<View>(null);

  const [draggingPlaced, setDraggingPlaced] = useState<{ id: string; type: DeviceType } | null>(null);

  const skipClearOnBlurRef = useRef(false);

  const {
    content,
    rid,

    stageBox,
    setStageBox,
    stageW,
    stageH,

    marginX,
    marginTop,
    marginBottom,

    getRoomRectContent,
    clampToRoomByPx,
    pxFromNorm,
  } = useRoomGeometry({
    floorId: floorId as FloorId,
    roomId: roomId as RoomId,
    MARKER_SIZE,
  });

  useSharedValue(1);

  const {
    placed,
    setPlaced,
    placedRef,

    toolbarDevices,
    devicesById,

    savedById,

    pendingIds,
    setPendingIds,
    pendingIdsRef,
    pendingPlacedRef,
  } = useRoomFirestore({
    roomId,
    floorId,
    stageBox,
    getRoomRectContent,
    pxFromNorm,
  });

  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [resolving, setResolving] = useState(false);

  // Popup
  const [selected, setSelected] = useState<PlacedDevice | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  // Toolbar single-tap details
  const [toolSelectedId, setToolSelectedId] = useState<string | null>(null);
  const toolSelected = useMemo(
    () => (toolSelectedId ? toolbarDevices.find((d) => d.id === toolSelectedId) ?? null : null),
    [toolSelectedId, toolbarDevices]
  );

  const [toolScrollW, setToolScrollW] = useState(0);
  const [toolContentW, setToolContentW] = useState(0);
  const [toolScrollX, setToolScrollX] = useState(0);

  const [toolIndicatorW, setToolIndicatorW] = useState(0);

  const canScrollToolbar = toolContentW > toolScrollW + 1;
  const toolMaxX = Math.max(0, toolContentW - toolScrollW);

  const toolVisibleRatio = toolContentW > 0 ? toolScrollW / toolContentW : 1;
  const toolThumbW = Math.max(26, toolIndicatorW * Math.min(1, toolVisibleRatio));
  const toolThumbMaxX = Math.max(0, toolIndicatorW - toolThumbW);
  const toolThumbX = toolMaxX > 0 ? (toolScrollX / toolMaxX) * toolThumbMaxX : 0;

  const { drag, makeToolGesture, makePlacedCombinedGesture, placedGhostStyle, onSaveAll } = useRoomDragDrop({
    roomId,

    rid,

    stageBox,
    stageW,
    stageH,

    marginX,
    marginTop,
    marginBottom,

    MARKER_SIZE,

    getRoomRectContent,
    clampToRoomByPx,

    placed,
    setPlaced,
    placedRef,

    savedById,

    pendingIds,
    setPendingIds,
    pendingIdsRef,

    pendingPlacedRef,

    setDraggingPlaced,
  });

  // blur listener
  useEffect(() => {
    const unsubBlur = navigation.addListener("blur", () => {

      if (skipClearOnBlurRef.current) return;


      setPlaced((prev: PlacedDevice[]) => prev.filter((p) => !pendingIdsRef.current.has(p.id)));


      pendingPlacedRef.current = {};


      setPendingIds(() => {
        const next = new Set<string>();
        pendingIdsRef.current = next;
        return next;
      });


      setToolSelectedId(null);
    });

    const unsubFocus = navigation.addListener("focus", () => {

      skipClearOnBlurRef.current = false;
    });

    return () => {
      unsubBlur();
      unsubFocus();
    };
  }, [navigation]);

  useEffect(() => {
    if (toolSelectedId && !toolbarDevices.some((x) => x.id === toolSelectedId)) {
      setToolSelectedId(null);
    }
  }, [toolSelectedId, toolbarDevices]);

  const selectedFs = useMemo(() => {
    if (!selected) return null;
    return devicesById[selected.id] ?? null;
  }, [selected, devicesById]);

  const openDetails = (item: PlacedDevice) => {
    setSelected(item);
    setDetailsOpen(true);
  };

  const closeDetails = () => {
    setDetailsOpen(false);
    setSelected(null);
  };

  const onEditSelected = () => {
    if (!selected) return;

    closeDetails();

    const info = devicesById[selected.id];


    skipClearOnBlurRef.current = true;

    navigation.navigate("DeviceFormModal", {
      device: {
        id: selected.id,
        name: info?.name ?? "",
        type: info?.typeRaw ?? "",
        status: info?.status ?? "inactive",
      },
      returnTo: { tab: "Map", screen: "Room", params: { floorId, roomId } },
    });
  };

  const onReportIssueSelected = () => {
    if (!selected) return;

    closeDetails();


    skipClearOnBlurRef.current = true;

    const parent = navigation.getParent();
    if (parent) {
      parent.navigate("Devices", {
        screen: "ReportIssue",
        params: { deviceId: selected.id, returnTo: { tab: "Map", screen: "Room", params: { floorId, roomId } } },
      });
    } else {
      navigation.navigate("Devices", {
        screen: "ReportIssue",
        params: { deviceId: selected.id, returnTo: { tab: "Map", screen: "Room", params: { floorId, roomId } } },
      });
    }
  };

  const onResolveIssueSelected = () => {
    if (!selected) return;
    if (resolving) return;

    Alert.alert(
      "Resolve issue",
      "Are you sure you want to mark this issue as resolved?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Resolve",
          style: "default",
          onPress: async () => {
            try {
              setResolving(true);
              await resolveDeviceIssue(selected.id);
              closeDetails();
            } finally {
              setResolving(false);
            }
          },
        },
      ]
    );
  };

  const onStageLayout = () => {
    requestAnimationFrame(() => {
      stageRef.current?.measureInWindow((x, y, width, height) => {
        setStageBox({ x, y, w: width, h: height });
        stageW.value = width;
        stageH.value = height;
      });
    });
  };

  const openDetailsById = (id: string) => {
    if (pendingIdsRef.current.size > 0) return;
    const item = placedRef.current.find((p) => p.id === id);
    if (!item) return;
    openDetails(item);
  };


  const onDeleteSelected = async () => {
    if (!selected) return;
    if (deleting) return;


    if (pendingIdsRef.current.has(selected.id)) {
      setPlaced((prev: PlacedDevice[]) => prev.filter((p) => p.id !== selected.id));

      setPendingIds((prev: Set<string>) => {
        const next = new Set(prev);
        next.delete(selected.id);
        pendingIdsRef.current = next;
        return next;
      });

      delete pendingPlacedRef.current[selected.id];

      closeDetails();
      return;
    }

    try {
      setDeleting(true);

      await updateDoc(doc(db, "devices", selected.id), {
        status: "inactive",
        roomId: deleteField(),
        x: deleteField(),
        y: deleteField(),
        updatedAt: serverTimestamp(),
      });

      setPlaced((prev: PlacedDevice[]) => prev.filter((p) => p.id !== selected.id));

      setPendingIds((prev: Set<string>) => {
        const next = new Set(prev);
        next.delete(selected.id);
        pendingIdsRef.current = next;
        return next;
      });

      delete pendingPlacedRef.current[selected.id];

      closeDetails();
    } finally {
      setDeleting(false);
    }
  };

  // ===== Icons =====
  const getTypeIconFromDefs = (typeRaw?: string) => {
    const key = (typeRaw ?? "").toLowerCase().trim();
    const found = DEVICE_TYPES.find((t) => t.label.toLowerCase().trim() === key);
    return found?.icon;
  };

  const fallbackIconByDeviceType = (type: DeviceType) => {
    if (type === "camera") return "cctv";
    if (type === "alarm") return "alarm-light";
    if (type === "sprinkler") return "sprinkler";
    return "badge-account-outline";
  };

  const renderToolIcon = (deviceId: string, fallbackType: DeviceType) => {
    const typeRaw = devicesById[deviceId]?.typeRaw;
    const icon = getTypeIconFromDefs(typeRaw) ?? fallbackIconByDeviceType(fallbackType);

    return <MaterialCommunityIcons name={icon} size={22} color="#2563EB" />;
  };

  const renderMarkerIcon = (deviceId: string, fallbackType: DeviceType, size: number) => {
    const typeRaw = devicesById[deviceId]?.typeRaw;
    const icon = getTypeIconFromDefs(typeRaw) ?? fallbackIconByDeviceType(fallbackType);

    return <MaterialCommunityIcons name={icon} size={size} color="#2563EB" />;
  };

  return (
    <View className="flex-1 bg-white overflow-hidden">
      <RoomToolbar
        toolSelected={toolSelected}
        toolSelectedId={toolSelectedId}
        setToolSelectedId={setToolSelectedId}
        devicesById={devicesById as Record<string, FsDeviceInfo>}
        toolbarDevices={toolbarDevices}
        pendingIds={pendingIds}
        placed={placed}
        makeToolGesture={makeToolGesture}
        renderToolIcon={renderToolIcon}
        canScrollToolbar={canScrollToolbar}
        toolThumbW={toolThumbW}
        toolThumbX={toolThumbX}
        setToolScrollW={setToolScrollW}
        setToolContentW={setToolContentW}
        setToolScrollX={setToolScrollX}
        setToolIndicatorW={setToolIndicatorW}
        onAddPress={() => {

          skipClearOnBlurRef.current = true;

          navigation.navigate("DeviceFormModal", {
            floorId,
            roomId,
            returnTo: { tab: "Map", screen: "Room", params: { floorId, roomId } },
          });
        }}
      />

      <RoomStage
        stageRef={stageRef}
        onStageLayout={onStageLayout}
        content={content}
        placed={placed}
        draggingPlaced={draggingPlaced}
        drag={drag}
        MARKER_SIZE={MARKER_SIZE}
        makePlacedCombinedGesture={(id: string, startX: number, startY: number, type: DeviceType) =>
          makePlacedCombinedGesture(id, startX, startY, type, openDetailsById)
        }
        renderMarkerIcon={renderMarkerIcon}
        placedGhostStyle={placedGhostStyle}
      />

      {/* Save button */}
      <View className="border-t border-gray-200 bg-white px-3 py-2.5">
        <Button
          label={saving ? "Saving..." : "Save"}
          onPress={() => onSaveAll(saving, setSaving)}
          disabled={saving || pendingIds.size === 0}
        />
      </View>

      <DeviceDetailsModal
        visible={detailsOpen}
        deleting={deleting}
        resolving={resolving}
        selectedFs={selectedFs}
        onClose={closeDetails}
        onEdit={onEditSelected}
        onReportIssue={onReportIssueSelected}
        onResolveIssue={onResolveIssueSelected}
        onRemove={onDeleteSelected}
      />
    </View>
  );
};

export default RoomScreen;
