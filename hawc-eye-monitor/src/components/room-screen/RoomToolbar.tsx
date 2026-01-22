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
        <View className="min-h-[54px] flex-row items-center justify-between px-3 py-2 border-b border-gray-200 bg-white">
          <View className="flex-row items-center gap-[10px] flex-1 pr-[10px]">
            <View className="w-10 h-10 rounded-[10px] items-center justify-center bg-gray-100">
              {renderToolIcon(toolSelected.id, toolSelected.type)}
            </View>
            <View className="flex-1">
              <Text className="text-[14px] font-extrabold text-gray-900">{devicesById[toolSelected.id]?.name ?? "-"}</Text>
              <Text className="text-[12px] text-gray-500 mt-0.5">Type: {devicesById[toolSelected.id]?.typeRaw ?? "-"}</Text>
            </View>
          </View>

          <Pressable className="w-[34px] h-[34px] rounded-[10px] items-center justify-center bg-gray-100" onPress={() => setToolSelectedId(null)}>
            <Ionicons name="close" size={18} color="#111827" />
          </Pressable>
        </View>
      )}

      <View className="h-[52px] border-b border-gray-200 bg-white">
        <View className="flex-1 flex-row items-center px-3 relative">
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerClassName="flex-row items-center gap-[10px] h-[52px] pr-[6px]"
            className="flex-1 mr-[10px]"
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
                    className={`w-10 h-10 rounded-[10px] items-center justify-center bg-gray-100 ${toolSelectedId === dev.id ? "border border-gray-900" : ""}`}
                  >
                    {renderToolIcon(dev.id, dev.type)}
                  </Pressable>
                </GestureDetector>
              ))}
          </ScrollView>

          <View
            pointerEvents="none"
            className={`absolute left-3 right-[62px] bottom-[5px] h-[6px] justify-center ${!canScrollToolbar ? "opacity-0" : ""}`}
            onLayout={(e) => setToolIndicatorW(e.nativeEvent.layout.width)}
          >
            <View className="h-1 rounded-full bg-gray-200 overflow-hidden">
              <View
                className="h-1 rounded-full bg-blue-300 opacity-[0.85]"
                style={[
                  {
                    width: toolThumbW,
                    transform: [{ translateX: toolThumbX }],
                  },
                ]}
              />
            </View>
          </View>

          <Pressable className="w-10 h-10 rounded-[10px] items-center justify-center bg-gray-100" onPress={onAddPress}>
            <Ionicons name="add" size={22} color="#111827" />
          </Pressable>
        </View>
      </View>
    </>
  );
};

export default RoomToolbar;
