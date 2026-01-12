// src/components/room-screen/RoomToolbar.tsx
import { View, Pressable, Text, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { GestureDetector } from "react-native-gesture-handler";
import { JSX } from "react";

type DeviceType = "camera" | "alarm" | "sprinkler" | "access";

type ToolbarDevice = { id: string; type: DeviceType; name?: string; status: string };
type FsDeviceInfo = { name?: string; typeRaw?: string; status?: string };

type ToolSelected = ToolbarDevice | null;

type Props = {
  styles: any;

  toolSelected: ToolSelected;
  toolSelectedId: string | null;
  setToolSelectedId: (id: string | null) => void;

  devicesById: Record<string, FsDeviceInfo>;
  toolbarDevices: ToolbarDevice[];
  pendingIds: Set<string>;
  placed: { id: string }[];

  makeToolGesture: (deviceId: string, type: DeviceType) => any;
  renderToolIcon: (deviceId: string, fallbackType: DeviceType) => JSX.Element;

  canScrollToolbar: boolean;
  toolThumbW: number;
  toolThumbX: number;

  setToolScrollW: (n: number) => void;
  setToolContentW: (n: number) => void;
  setToolScrollX: (n: number) => void;
  setToolIndicatorW: (n: number) => void;

  onAddPress: () => void;
};

const RoomToolbar = ({
  styles,
  toolSelected,
  toolSelectedId,
  setToolSelectedId,
  devicesById,
  toolbarDevices,
  pendingIds,
  placed,
  makeToolGesture,
  renderToolIcon,
  canScrollToolbar,
  toolThumbW,
  toolThumbX,
  setToolScrollW,
  setToolContentW,
  setToolScrollX,
  setToolIndicatorW,
  onAddPress,
}: Props) => {
  return (
    <>
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

          {/* ✅ Custom horizontal scrollbar (same design) */}
          <View
            pointerEvents="none"
            style={[styles.toolbarIndicatorWrap, !canScrollToolbar && styles.hidden]}
            onLayout={(e) => setToolIndicatorW(e.nativeEvent.layout.width)}
          >
            <View style={styles.toolbarIndicatorTrack}>
              <View
                style={[
                  styles.toolbarIndicatorThumb,
                  {
                    width: toolThumbW,
                    transform: [{ translateX: toolThumbX }],
                  },
                ]}
              />
            </View>
          </View>

          <Pressable style={styles.addBtn} onPress={onAddPress}>
            <Ionicons name="add" size={22} color="#111827" />
          </Pressable>
        </View>
      </View>
    </>
  );
};

export default RoomToolbar;
