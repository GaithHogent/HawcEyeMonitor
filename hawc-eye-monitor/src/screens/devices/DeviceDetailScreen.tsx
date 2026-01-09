// src/screens/devices/DeviceDetailScreen.tsx
import { useMemo, useState } from "react";
import { View, Text, Pressable, Alert, ActivityIndicator } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import type { DevicesStackNavProps, DevicesStackParamsList } from "../../navigators/types";
import type { RouteProp } from "@react-navigation/native";
import type { DeviceItem } from "../../types/device";
import { removeDevice } from "../../services/devices.service";

type R = RouteProp<DevicesStackParamsList, "DeviceDetail">;

export default function DeviceDetailScreen() {
  const navigation = useNavigation<DevicesStackNavProps<"DeviceDetail">["navigation"]>();
  const route = useRoute<R>();
  const device = route.params.device as DeviceItem;

  const [deleting, setDeleting] = useState(false);

  const location = useMemo(() => {
    const parts: string[] = [];
    if (device.floor !== undefined) parts.push(`Floor: ${device.floor}`);
    if (device.roomId) parts.push(`Room: ${device.roomId}`);
    if (device.x !== undefined && device.y !== undefined) parts.push(`x:${device.x}, y:${device.y}`);
    return parts.join(" • ");
  }, [device]);

  const onDelete = () => {
    Alert.alert(
      "Delete device",
      "Are you sure you want to delete this device?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              setDeleting(true);
              await removeDevice(device.id);
              navigation.goBack();
            } finally {
              setDeleting(false);
            }
          },
        },
      ]
    );
  };

  return (
    <View className="flex-1 bg-white p-4">
      <View className="rounded-2xl border border-gray-200 p-4">
        <Text className="text-xl font-bold text-gray-900">{device.name}</Text>
        <Text className="mt-1 text-sm text-gray-700">{device.type}</Text>

        <View className="mt-3">
          <Text className="text-xs text-gray-500">Status</Text>
          <Text className="text-sm text-gray-900">{device.status}</Text>
        </View>

        {!!device.description && (
          <View className="mt-3">
            <Text className="text-xs text-gray-500">Description</Text>
            <Text className="text-sm text-gray-900">{device.description}</Text>
          </View>
        )}

        {!!location && (
          <View className="mt-3">
            <Text className="text-xs text-gray-500">Location</Text>
            <Text className="text-sm text-gray-900">{location}</Text>
          </View>
        )}

        {device.status === "issue" && (
          <View className="mt-4 rounded-xl bg-red-50 p-3">
            <Text className="text-sm font-semibold text-red-800">Issue</Text>
            {!!device.issueType && <Text className="mt-1 text-sm text-red-700">{device.issueType}</Text>}
            {!!device.issueDescription && (
              <Text className="mt-1 text-sm text-red-700">{device.issueDescription}</Text>
            )}
          </View>
        )}
      </View>

      <View className="mt-4 flex-row gap-3">
        <Pressable
          onPress={() => navigation.navigate("DeviceForm", { device })}
          className="flex-1 h-12 rounded-xl items-center justify-center bg-gray-900"
        >
          <Text className="text-white font-semibold">Edit</Text>
        </Pressable>

        <Pressable
          onPress={onDelete}
          disabled={deleting}
          className="flex-1 h-12 rounded-xl items-center justify-center bg-red-600"
        >
          {deleting ? <ActivityIndicator /> : <Text className="text-white font-semibold">Delete</Text>}
        </Pressable>
      </View>
    </View>
  );
}
