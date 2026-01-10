// src/components/devices/DeviceListItem.tsx
import { View, Text, Pressable } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import type { DeviceItem } from "../../types/device";
import { DEVICE_STATUSES } from "../../types/deviceStatuses";
import { DEVICE_TYPES } from "../../types/deviceTypes";

type Props = {
  device: DeviceItem;
  onPress: () => void;
};

const DeviceListItem = ({ device, onPress }: Props) => {
  const statusDef = DEVICE_STATUSES.find((s) => s.key === device.status);
  const typeDef = DEVICE_TYPES.find((t) => t.label === device.type);

  return (
    <Pressable
      onPress={onPress}
      className="mb-3 rounded-2xl bg-white p-4 shadow-sm"
    >
      <View className="flex-row items-center justify-between">
        <View className="flex-1">
          <View className="flex-row items-center">
            <MaterialCommunityIcons
              name={typeDef?.icon ?? "devices"}
              size={20}
              color="#0d7ff2"
            />
            <Text className="ml-2 text-base font-semibold text-gray-900" numberOfLines={1}>
              {device.name}
            </Text>
          </View>
          <Text className="mt-1 text-sm text-gray-500">See more device details</Text>
        </View>

        <View
          className={[
            "ml-3 px-2.5 py-1 rounded-full",
            device.status === "active" ? "bg-green-100" : "",
            device.status === "inactive" ? "bg-gray-100" : "",
            device.status === "issue" ? "bg-red-100" : "",
          ].join(" ")}
        >
          <Text
            className={[
              "text-xs font-semibold",
              device.status === "active" ? "text-green-700" : "",
              device.status === "inactive" ? "text-gray-700" : "",
              device.status === "issue" ? "text-red-700" : "",
            ].join(" ")}
          >
            {statusDef?.label ?? device.status}
          </Text>
        </View>
      </View>
    </Pressable>
  );
};

export default DeviceListItem;
