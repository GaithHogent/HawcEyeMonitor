// src/screens/RoomScreen.tsx
import { useMemo, useState, useEffect, useCallback, useRef } from "react";
import { View, StyleSheet, Pressable, Text, Modal, ScrollView } from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import Animated, { useSharedValue, runOnJS } from "react-native-reanimated";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import Floor1Svg from "../components/full-floor-map-screen/Floor1Svg";
import Floor2Svg from "../components/full-floor-map-screen/Floor2Svg";
import Floor3Svg from "../components/full-floor-map-screen/Floor3Svg";
import {
  collection,
  onSnapshot,
  query,
  writeBatch,
  doc,
  serverTimestamp,
  updateDoc,
  deleteField,
  where,
} from "firebase/firestore";
import { db } from "../config/firebase";
import Button from "../components/Button";
import { DEVICE_TYPES } from "../types/deviceTypes";

type Params = { floorId: string; roomId: string };

type DeviceType = "camera" | "alarm" | "sprinkler" | "access";
type PlacedDevice = { id: string; type: DeviceType; x: number; y: number };

// ✅ devices اللي تجي من الفايرستور (للشريط فقط)
type ToolbarDevice = { id: string; type: DeviceType; name?: string; status: string };

// ✅ تفاصيل الجهاز من Firestore (للـ popup داخل الغرفة)
type FsDeviceInfo = { name?: string; typeRaw?: string; status?: string };

const TOOLBAR_H = 52;
const MARKER_SIZE = 28;

// default margins (لغرف عادية)
const DEFAULT_MARGIN_X = 0.18; // يمين/يسار
const DEFAULT_MARGIN_TOP = 0.12; // فوق
const DEFAULT_MARGIN_BOTTOM = 0.18; // جوه

// ===== غرف اليمين (Room 101/102/103) =====
const RIGHT_MARGIN_X = 0.2;
const RIGHT_MARGIN_TOP = 0.1;
const RIGHT_MARGIN_BOTTOM = 0.1;

// fix: فقط للـ meeting rooms (مشكلة الجهة اليمنى أثناء التحريك)
const MEETING_RIGHT_SAFE_PAD = 28;
const STAIRS_BOTTOM_SAFE_PAD = 118;
const STAIRS_RIGHT_SAFE_PAD = 12;
const CORRIDOR_BOTTOM_SAFE_PAD = 24;
const RESTROOM_PAD_LEFT = 12;
const RESTROOM_PAD_RIGHT = 16;
const RESTROOM_PAD_TOP = 60;
const RESTROOM_PAD_BOTTOM = 165;

const RoomScreen = () => {
  const { params } = useRoute<any>();
  const { floorId, roomId } = params as Params;
  const navigation = useNavigation<any>();
  const stageRef = useRef<View>(null);

  const content = useMemo(() => {
    if (floorId === "1") return <Floor1Svg onlyRoomId={roomId} />;
    if (floorId === "2") return <Floor2Svg onlyRoomId={roomId} />;
    return <Floor3Svg onlyRoomId={roomId} />;
  }, [floorId, roomId]);

  // ===== margins حسب نوع الغرفة =====
  const rid = (roomId ?? "").toLowerCase();

  const isRightRoom =
    rid.includes("room 101") ||
    rid.includes("room 102") ||
    rid.includes("room 103") ||
    rid === "room101" ||
    rid === "room102" ||
    rid === "room103";

  let mx = DEFAULT_MARGIN_X;
  let mt = DEFAULT_MARGIN_TOP;
  let mb = DEFAULT_MARGIN_BOTTOM;

  // غرف اليمين
  if (isRightRoom) {
    mx = RIGHT_MARGIN_X;
    mt = RIGHT_MARGIN_TOP;
    mb = RIGHT_MARGIN_BOTTOM;
  }

  // الخاص: corridor/stairs/restroom (يغطون على أي شيء)
  if (rid.includes("corridor")) {
    mx = 0.42;
    mt = 0.08;
    mb = 0.08;
  } else if (rid.includes("stairs")) {
    mx = 0.3;
    mt = 0.25;
    mb = 0.25;
  } else if (rid.includes("restroom") || rid === "wc") {
    mx = 0.34;
    mt = 0.22;
    mb = 0.22;
  }

  // shared values
  const marginX = useSharedValue(mx);
  const marginTop = useSharedValue(mt);
  const marginBottom = useSharedValue(mb);

  useEffect(() => {
    marginX.value = mx;
    marginTop.value = mt;
    marginBottom.value = mb;
  }, [mx, mt, mb]);

  // scale ثابت
  useSharedValue(1);

  // مساحة الـ stage
  const [stageBox, setStageBox] = useState({ x: 0, y: 0, w: 0, h: 0 });
  const stageW = useSharedValue(0);
  const stageH = useSharedValue(0);

  // أجهزة على الغرفة
  const [placed, setPlaced] = useState<PlacedDevice[]>([]);

  // Toolbar inactive فقط
  const [toolbarDevices, setToolbarDevices] = useState<ToolbarDevice[]>([]);

  // Map لكل الأجهزة (للاسم/النوع بالبوباب)
  const [devicesById, setDevicesById] = useState<Record<string, FsDeviceInfo>>({});

  // ✅ الأجهزة المحفوظة فعلياً (active بالغرفة) -> حتى نعرف هذا Active وموجود
  const [savedById, setSavedById] = useState<Record<string, { x: number; y: number }>>({});

  // ✅ pending فقط للأجهزة الجديدة اللي جت من التاب (مو للأكتيف)
  const [pendingIds, setPendingIds] = useState<Set<string>>(new Set());

  // ✅ FIX: ref حتى onSnapshot يشوف أحدث pendingIds
  const pendingIdsRef = useRef<Set<string>>(new Set());
  useEffect(() => {
    pendingIdsRef.current = pendingIds;
  }, [pendingIds]);

  // ✅ FIX: خزن أماكن pending بشكل مستقل حتى الـ onSnapshot ما يمسحها بسبب Race
  const pendingPlacedRef = useRef<Record<string, PlacedDevice>>({});

  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // سحب جارٍ (ghost)
  const [drag, setDrag] = useState<{ id: string; type: DeviceType; x: number; y: number } | null>(null);

  // Popup
  const [selected, setSelected] = useState<PlacedDevice | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  // Toolbar single-tap details
  const [toolSelectedId, setToolSelectedId] = useState<string | null>(null);
  const toolSelected = useMemo(
    () => (toolSelectedId ? toolbarDevices.find((d) => d.id === toolSelectedId) ?? null : null),
    [toolSelectedId, toolbarDevices]
  );

  // ✅ hint للـ horizontal scroll بالـ toolbar
  const [toolScrollW, setToolScrollW] = useState(0);
  const [toolContentW, setToolContentW] = useState(0);
  const [toolScrollX, setToolScrollX] = useState(0);

  const canScrollToolbar = toolContentW > toolScrollW + 1;
  const toolMaxX = Math.max(0, toolContentW - toolScrollW);
  const atToolbarEnd = toolScrollX >= toolMaxX - 1;
  const showToolbarScrollHint = canScrollToolbar && !atToolbarEnd;

  // ✅ blur listener
  useEffect(() => {
    const unsub = navigation.addListener("blur", () => {
      // ✅ شيل كل الأجهزة اللي ما انحفظت
      setPlaced((prev) => prev.filter((p) => !pendingIdsRef.current.has(p.id)));

      // ✅ نظّف pending refs
      pendingPlacedRef.current = {};

      // ✅ رجعهم للشريط
      setPendingIds(() => {
        const next = new Set<string>();
        pendingIdsRef.current = next;
        return next;
      });

      // (اختياري) نظّف اختيار الشريط
      setToolSelectedId(null);
    });

    return unsub;
  }, [navigation]);

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

  const onStageLayout = () => {
    requestAnimationFrame(() => {
      stageRef.current?.measureInWindow((x, y, width, height) => {
        setStageBox({ x, y, w: width, h: height });
        stageW.value = width;
        stageH.value = height;
      });
    });
  };

  // ===== Helpers =====
  const getAllowedRectScreen = () => {
    const ax = stageBox.x + stageBox.w * marginX.value;
    const aw = stageBox.w * (1 - marginX.value * 2);

    const ay = stageBox.y + stageBox.h * marginTop.value;
    const ah = stageBox.h * (1 - marginTop.value - marginBottom.value);

    return { x: ax, y: ay, w: aw, h: ah };
  };

  const getAllowedRectContent = () => {
    const contentW = stageW.value;
    const contentH = stageH.value;

    const x = contentW * marginX.value;
    const w = contentW * (1 - marginX.value * 2);

    const y = contentH * marginTop.value;
    const h = contentH * (1 - marginTop.value - marginBottom.value);

    return { x, y, w, h };
  };

  const mapToDeviceType = (t: string): DeviceType => {
    const x = (t ?? "").toLowerCase().trim();
    if (x === "fire") return "alarm";
    if (x === "motion") return "camera";
    if (x === "camera") return "camera";
    if (x === "sprinkler") return "sprinkler";
    if (x === "access") return "access";
    return "camera";
  };

  const typeLabel = (type: DeviceType) => {
    if (type === "camera") return "Camera";
    if (type === "alarm") return "Alarm";
    if (type === "sprinkler") return "Sprinkler";
    return "Access";
  };

  // ===== Firestore: كل الأجهزة (للشريط + الاسم/النوع) =====
  useEffect(() => {
    const q = query(collection(db, "devices"));

    const unsub = onSnapshot(q, (snap) => {
      const toolbar: ToolbarDevice[] = [];
      const map: Record<string, FsDeviceInfo> = {};

      snap.forEach((docSnap) => {
        const d: any = docSnap.data();
        const name = d?.name ? String(d.name) : undefined;
        const typeRaw = d?.type ? String(d.type) : undefined;

        
        const status = String(d?.status ?? "").toLowerCase().trim();

        map[docSnap.id] = { name, typeRaw, status };

        // الشريط فقط للأجهزة inactive
        if (status !== "inactive") return;

        const type = mapToDeviceType(typeRaw ?? "");
        toolbar.push({ id: docSnap.id, type, name, status });
      });

      setDevicesById(map);
      setToolbarDevices(toolbar);

      if (toolSelectedId && !toolbar.some((x) => x.id === toolSelectedId)) {
        setToolSelectedId(null);
      }
    });

    return () => unsub();
  }, [toolSelectedId]);

  // ===== Firestore: الأجهزة الأكتيف داخل هالغرفة (حتى تبقى ثابتة) =====
  useEffect(() => {
    const q = query(collection(db, "devices"), where("status", "==", "active"), where("roomId", "==", roomId));

    const unsub = onSnapshot(q, (snap) => {
      const fsMap: Record<string, PlacedDevice> = {};
      const nextSaved: Record<string, { x: number; y: number }> = {};

      snap.forEach((docSnap) => {
        const d: any = docSnap.data();
        const xVal = d?.x;
        const yVal = d?.y;
        if (typeof xVal !== "number" || typeof yVal !== "number") return;

        nextSaved[docSnap.id] = { x: xVal, y: yVal };

        const typeRaw = d?.type ? String(d.type) : "";
        const type = mapToDeviceType(typeRaw);

        fsMap[docSnap.id] = { id: docSnap.id, type, x: xVal, y: yVal };
      });

      setSavedById(nextSaved);

      // ✅ دمج: active من الفايرستور + pending من ref (حتى لو صار Race)
      setPlaced(() => {
        const pendingLocal = Object.values(pendingPlacedRef.current).filter((p) => !fsMap[p.id]);
        return [...Object.values(fsMap), ...pendingLocal];
      });

      // pending لازم يبقى فقط للجدد (اللي بعدهم مو موجودين بـ nextSaved)
      setPendingIds((prev) => {
        const next = new Set(prev);
        next.forEach((id) => {
          if (nextSaved[id]) {
            next.delete(id);
            delete pendingPlacedRef.current[id]; // ✅ إذا صار Active، شيله من pendingPlacedRef
          }
        });
        pendingIdsRef.current = next;
        return next;
      });
    });

    return () => unsub();
  }, [roomId]);

  // ===== Drop device from toolbar =====
  // ✅ FIX: drop أسهل + snap للداخل + مضمون داخل الغرفة
  const placeIfInside = (deviceId: string, type: DeviceType, absX: number, absY: number) => {
    // إذا القياسات مو جاهزة
    if (stageBox.w <= 0 || stageBox.h <= 0 || stageW.value <= 0 || stageH.value <= 0) return;

    // حول إلى local داخل الـ stage
    const localX0 = absX - stageBox.x;
    const localY0 = absY - stageBox.y;

    // allowed داخل الـ content
    const contentW = stageW.value;
    const contentH = stageH.value;

    const ax = contentW * marginX.value;
    const aw = contentW * (1 - marginX.value * 2);

    const ay = contentH * marginTop.value;
    const ah = contentH * (1 - marginTop.value - marginBottom.value);

    // وسّع منطقة الإسقاط (حتى ما تحتاج أكثر من محاولة)
    const DROP_PAD = 26;

    const insideNear =
      localX0 >= ax - DROP_PAD &&
      localX0 <= ax + aw + DROP_PAD &&
      localY0 >= ay - DROP_PAD &&
      localY0 <= ay + ah + DROP_PAD;

    if (!insideNear) return;

    // ✅ clamp داخل حدود الغرفة (نفس منطق السحب)
    const isMeetingRoom = rid.includes("meeting");
    const isStairs = rid.includes("stairs");
    const isCorridor = rid.includes("corridor");
    const isRestroom = rid.includes("restroom") || rid === "wc";

    const minX = ax + (isRestroom ? RESTROOM_PAD_LEFT : 0);
    const maxX =
      ax +
      aw -
      (isMeetingRoom ? MEETING_RIGHT_SAFE_PAD : 0) -
      (isStairs ? STAIRS_RIGHT_SAFE_PAD : 0) -
      (isRestroom ? RESTROOM_PAD_RIGHT : 0);

    const minY = ay + (isRestroom ? RESTROOM_PAD_TOP : 0);
    const maxY =
      ay +
      ah -
      (isStairs ? STAIRS_BOTTOM_SAFE_PAD : 0) -
      (isCorridor ? CORRIDOR_BOTTOM_SAFE_PAD : 0) -
      (isRestroom ? RESTROOM_PAD_BOTTOM : 0);

    const clampedX = Math.min(Math.max(minX, localX0), maxX);
    const clampedY = Math.min(Math.max(minY, localY0), maxY);

    // ✅ خزنه كـ pending ref (حتى ما يختفي)
    pendingPlacedRef.current[deviceId] = { id: deviceId, type, x: clampedX, y: clampedY };

    // ✅ حدّث الـ placed مباشرة (عرض الماركر)
    setPlaced((prev) => {
      const others = prev.filter((p) => p.id !== deviceId);
      return [...others, { id: deviceId, type, x: clampedX, y: clampedY }];
    });

    // ✅ pending (تفعيل زر Save)
    setPendingIds((prev) => {
      const next = new Set(prev);
      next.add(deviceId);
      pendingIdsRef.current = next;
      return next;
    });
  };

  // ✅ Save: فقط للجدد اللي جايين من التاب
  const onSaveAll = async () => {
    if (saving) return;
    if (pendingIds.size === 0) return;

    try {
      setSaving(true);

      const batch = writeBatch(db);

      pendingIds.forEach((id) => {
        const p = pendingPlacedRef.current[id] ?? placed.find((x) => x.id === id);
        if (!p) return;

        batch.update(doc(db, "devices", id), {
          status: "active",
          roomId,
          x: p.x,
          y: p.y,
          updatedAt: serverTimestamp(),
        });
      });

      await batch.commit();

      // بعد الكوميت، onSnapshot راح يشيلهم من pendingIds تلقائياً
      setPendingIds(() => {
        const next = new Set<string>();
        pendingIdsRef.current = next;
        pendingPlacedRef.current = {};
        return next;
      });
    } finally {
      setSaving(false);
    }
  };

  // ✅ Active move: ينحفظ مباشرة بدون ما يشتغل زر Save
  const saveActivePosition = useCallback(
    async (id: string, x: number, y: number) => {
      if (!savedById[id]) return;

      try {
        await updateDoc(doc(db, "devices", id), {
          x,
          y,
          updatedAt: serverTimestamp(),
        });
      } catch {}
    },
    [savedById]
  );

  // update local position (بدون pending للأكتيف)
  const updatePlacedLocal = (id: string, x: number, y: number) => {
    setPlaced((prev) => prev.map((p) => (p.id === id ? { ...p, x, y } : p)));

    setPendingIds((prev) => {
      if (savedById[id]) return prev;
      const next = new Set(prev);
      next.add(id);
      pendingIdsRef.current = next;
      pendingPlacedRef.current[id] = { id, type: placed.find((p) => p.id === id)?.type ?? "camera", x, y };
      return next;
    });
  };

  // ✅ Delete: يرجع للشريط + يحذف roomId/x/y
  const onDeleteSelected = async () => {
    if (!selected) return;
    if (deleting) return;

    // ✅ إذا الجهاز Pending (لسه ما محفوظ)
    if (pendingIdsRef.current.has(selected.id)) {
      setPlaced((prev) => prev.filter((p) => p.id !== selected.id));

      setPendingIds((prev) => {
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

      setPlaced((prev) => prev.filter((p) => p.id !== selected.id));

      setPendingIds((prev) => {
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

  // ===== Gestures =====
  const makeToolGesture = (deviceId: string, type: DeviceType) =>
    Gesture.Pan()
      .activateAfterLongPress(250)
      .onBegin((e) => {
        runOnJS(setDrag)({ id: deviceId, type, x: e.absoluteX, y: e.absoluteY });
      })
      .onUpdate((e) => {
        runOnJS(setDrag)({ id: deviceId, type, x: e.absoluteX, y: e.absoluteY });
      })
      .onEnd((e) => {
        runOnJS(setDrag)(null);
        runOnJS(placeIfInside)(deviceId, type, e.absoluteX, e.absoluteY);
      })
      .onFinalize(() => {
        runOnJS(setDrag)(null);
      });

  const dragStartX = useSharedValue(0);
  const dragStartY = useSharedValue(0);

  const lastX = useSharedValue(0);
  const lastY = useSharedValue(0);

  const onPlacedDragEnd = (id: string, x: number, y: number) => {
    if (savedById[id]) {
      saveActivePosition(id, x, y);
    } else {
      // pending: حدّث ref حتى لو صار أي re-render
      const p = placed.find((pp) => pp.id === id);
      if (p) pendingPlacedRef.current[id] = { ...p, x, y };
    }
  };

  const makePlacedGesture = (id: string, startX: number, startY: number) =>
    Gesture.Pan()
      .activateAfterLongPress(250)
      .onStart(() => {
        dragStartX.value = startX;
        dragStartY.value = startY;
        lastX.value = startX;
        lastY.value = startY;
      })
      .onUpdate((e) => {
        const nextX = dragStartX.value + e.translationX;
        const nextY = dragStartY.value + e.translationY;

        const contentW = stageW.value;
        const contentH = stageH.value;

        const ax = contentW * marginX.value;
        const aw = contentW * (1 - marginX.value * 2);

        const ay = contentH * marginTop.value;
        const ah = contentH * (1 - marginTop.value - marginBottom.value);

        const isMeetingRoom = rid.includes("meeting");
        const isStairs = rid.includes("stairs");
        const isCorridor = rid.includes("corridor");
        const isRestroom = rid.includes("restroom") || rid === "wc";

        const minX = ax + (isRestroom ? RESTROOM_PAD_LEFT : 0);
        const maxX =
          ax +
          aw -
          (isMeetingRoom ? MEETING_RIGHT_SAFE_PAD : 0) -
          (isStairs ? STAIRS_RIGHT_SAFE_PAD : 0) -
          (isRestroom ? RESTROOM_PAD_RIGHT : 0);

        const minY = ay + (isRestroom ? RESTROOM_PAD_TOP : 0);
        const maxY =
          ay +
          ah -
          (isStairs ? STAIRS_BOTTOM_SAFE_PAD : 0) -
          (isCorridor ? CORRIDOR_BOTTOM_SAFE_PAD : 0) -
          (isRestroom ? RESTROOM_PAD_BOTTOM : 0);

        const clampedX = Math.min(Math.max(minX, nextX), maxX);
        const clampedY = Math.min(Math.max(minY, nextY), maxY);

        lastX.value = clampedX;
        lastY.value = clampedY;

        runOnJS(updatePlacedLocal)(id, clampedX, clampedY);
      })
      .onEnd(() => {
        runOnJS(onPlacedDragEnd)(id, lastX.value, lastY.value);
      });

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

    return <MaterialCommunityIcons name={icon} size={22} color="#111827" />;
  };

  const renderMarkerIcon = (deviceId: string, fallbackType: DeviceType, size: number) => {
    const typeRaw = devicesById[deviceId]?.typeRaw;
    const icon = getTypeIconFromDefs(typeRaw) ?? fallbackIconByDeviceType(fallbackType);

    return <MaterialCommunityIcons name={icon} size={size} color="#111827" />;
  };

  const renderGhostIcon = (type: DeviceType) => {
    const icon = fallbackIconByDeviceType(type);
    return <MaterialCommunityIcons name={icon} size={18} color="#111827" />;
  };

  return (
    <View style={styles.root}>
      {toolSelected && (
        <View style={styles.toolDetailsBar}>
          <View style={styles.toolDetailsLeft}>
            <View style={styles.toolDetailsIcon}>{renderToolIcon(toolSelected.id, toolSelected.type)}</View>
            <View style={styles.toolDetailsText}>
              <Text style={styles.toolDetailsTitle}>{devicesById[toolSelected.id]?.name ?? "-"}</Text>
              <Text style={styles.toolDetailsDesc}>Type: {devicesById[toolSelected.id]?.typeRaw ?? "-"}</Text>
            </View>
          </View>

          <Pressable style={styles.toolDetailsClose} onPress={() => setToolSelectedId(null)}>
            <Ionicons name="close" size={18} color="#111827" />
          </Pressable>
        </View>
      )}

      <View style={styles.toolbar}>
        <View style={styles.toolbarRow}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.toolbarScrollContent}
            style={styles.toolbarScroll}
            onLayout={(e) => setToolScrollW(e.nativeEvent.layout.width)}
            onContentSizeChange={(w) => setToolContentW(w)}
            onScroll={(e) => setToolScrollX(e.nativeEvent.contentOffset.x)}
            scrollEventThrottle={16}
          >
            {toolbarDevices
              .filter((dev) => !(pendingIds.has(dev.id) && placed.some((p) => p.id === dev.id)))
              .map((dev) => (
                <GestureDetector key={dev.id} gesture={makeToolGesture(dev.id, dev.type)}>
                  <Pressable
                    onPress={() => setToolSelectedId(dev.id)}
                    style={[styles.toolBtn, toolSelectedId === dev.id && styles.toolBtnActive]}
                  >
                    {renderToolIcon(dev.id, dev.type)}
                  </Pressable>
                </GestureDetector>
              ))}
          </ScrollView>

          <View pointerEvents="none" style={[styles.toolbarScrollHintWrap, !showToolbarScrollHint && styles.hidden]}>
            <View style={styles.toolbarScrollHint} />
          </View>

          <Pressable
            style={styles.addBtn}
            onPress={() =>
              navigation.navigate("DeviceFormModal", {
                floorId,
                roomId,
                returnTo: { tab: "Map", screen: "Room", params: { floorId, roomId } },
              })
            }
          >
            <Ionicons name="add" size={22} color="#111827" />
          </Pressable>
        </View>
      </View>

      <View ref={stageRef} style={styles.stageWrap} onLayout={onStageLayout}>
        <Animated.View style={styles.stage}>
          <View style={styles.canvas}>
            {content}

            {placed.map((d) => (
              <GestureDetector key={d.id} gesture={makePlacedGesture(d.id, d.x, d.y)}>
                <Pressable
                  onPress={() => openDetails(d)}
                  style={[
                    styles.marker,
                    {
                      left: d.x - MARKER_SIZE / 2,
                      top: d.y - MARKER_SIZE / 2,
                    },
                  ]}
                >
                  {renderMarkerIcon(d.id, d.type, 18)}
                </Pressable>
              </GestureDetector>
            ))}
          </View>
        </Animated.View>

        {drag && (
          <View
            pointerEvents="none"
            style={[
              styles.ghost,
              {
                left: drag.x - MARKER_SIZE / 2,
                top: drag.y - MARKER_SIZE / 2,
              },
            ]}
          >
            {renderMarkerIcon(drag.id, drag.type, 18)}
          </View>
        )}
      </View>

      {/* ✅ Save button */}
      <View style={styles.saveBar}>
        <Button label={saving ? "Saving..." : "Save"} onPress={onSaveAll} disabled={saving || pendingIds.size === 0} />
      </View>

      <Modal visible={detailsOpen} transparent animationType="fade" onRequestClose={closeDetails}>
        <Pressable style={styles.modalBackdrop} onPress={closeDetails}>
          <Pressable style={styles.modalCard} onPress={() => {}}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Device details</Text>

              <Pressable style={styles.modalCloseBtn} onPress={closeDetails} hitSlop={10}>
                <Ionicons name="close" size={18} color="#111827" />
              </Pressable>
            </View>

            <Text style={styles.modalRow}>Name: {selectedFs?.name ?? "-"}</Text>
            <Text style={styles.modalRow}>Type: {selectedFs?.typeRaw ?? "-"}</Text>
            <Text style={styles.modalRow}>Status: {selectedFs?.status ?? "-"}</Text>

            <View style={styles.modalActions}>
              <Button label="Edit" onPress={onEditSelected} variant="outline" disabled={deleting} />
              <Button label={deleting ? "Removing..." : "Remove form this room"} onPress={onDeleteSelected} disabled={deleting} />
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
};

export default RoomScreen;

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#fff", overflow: "hidden" },

  toolDetailsBar: {
    minHeight: 54,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    backgroundColor: "#fff",
  },
  toolDetailsLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
    paddingRight: 10,
  },
  toolDetailsIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f3f4f6",
  },
  toolDetailsText: { flex: 1 },
  toolDetailsTitle: { fontSize: 14, fontWeight: "800", color: "#111827" },
  toolDetailsDesc: { fontSize: 12, color: "#6b7280", marginTop: 2 },
  toolDetailsClose: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f3f4f6",
  },

  toolbar: {
    height: TOOLBAR_H,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    backgroundColor: "#fff",
  },
  toolbarRow: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    position: "relative",
  },
  toolbarScroll: {
    flex: 1,
    marginRight: 10,
  },
  toolbarScrollContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    height: TOOLBAR_H,
    paddingRight: 6,
  },
  toolbarScrollHintWrap: {
    position: "absolute",
    left: 12,
    right: 62,
    bottom: 5,
    alignItems: "center",
    justifyContent: "center",
  },
  toolbarScrollHint: {
    width: 34,
    height: 3,
    borderRadius: 999,
    backgroundColor: "#93c5fd",
    opacity: 0.65,
  },
  hidden: { opacity: 0 },

  toolBtn: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f3f4f6",
  },
  toolBtnActive: { borderWidth: 1, borderColor: "#111827" },
  addBtn: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f3f4f6",
  },

  stageWrap: { flex: 1 },
  stage: { flex: 1 },
  canvas: { flex: 1 },

  marker: {
    position: "absolute",
    width: MARKER_SIZE,
    height: MARKER_SIZE,
    borderRadius: 10,
    backgroundColor: "#f3f4f6",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },

  ghost: {
    position: "absolute",
    width: MARKER_SIZE,
    height: MARKER_SIZE,
    borderRadius: 10,
    backgroundColor: "rgba(243,244,246,0.9)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },

  saveBar: {
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    backgroundColor: "#fff",
    paddingHorizontal: 12,
    paddingVertical: 10,
  },

  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    padding: 20,
    justifyContent: "center",
  },
  modalCard: { backgroundColor: "#fff", borderRadius: 14, padding: 16 },
  modalTitle: { fontSize: 16, fontWeight: "700", color: "#111827", marginBottom: 10 },
  modalRow: { fontSize: 14, color: "#374151", marginBottom: 6 },
  modalActions: { flexDirection: "row", gap: 10, marginTop: 14 },

  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  modalCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f3f4f6",
  },
});
