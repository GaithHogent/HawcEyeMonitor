// src/screens/devices/DevicesListScreen.tsx
import { useEffect, useState } from "react";
import { View, Text, FlatList, Pressable, ActivityIndicator } from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { DevicesStackNavProps } from "../../navigators/types";
import type { DeviceItem } from "../../types/device";
import { subscribeDevices } from "../../services/devices.service";

export default function DevicesListScreen() {
  const navigation = useNavigation<DevicesStackNavProps<"DevicesList">["navigation"]>();
  const [devices, setDevices] = useState<DeviceItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = subscribeDevices((items) => {
      setDevices(items);
      setLoading(false);
    });
    return unsub;
  }, []);

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator />
        <Text className="mt-3 text-gray-600">Loading devices...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      <FlatList
        data={devices}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16, paddingBottom: 96 }}
        ListEmptyComponent={
          <View className="py-10 items-center">
            <Text className="text-gray-600">No devices yet.</Text>
          </View>
        }
        renderItem={({ item }) => (
          <Pressable
            onPress={() => navigation.navigate("DeviceDetail", { device: item })}
            className="mb-3 rounded-xl border border-gray-200 bg-white p-4"
          >
            <View className="flex-row items-center justify-between">
              <Text className="text-base font-semibold text-gray-900">{item.name}</Text>
              <Text className="text-xs text-gray-500">{item.status}</Text>
            </View>

            <Text className="mt-1 text-sm text-gray-700">{item.type}</Text>

            {!!item.description && (
              <Text className="mt-2 text-sm text-gray-500">{item.description}</Text>
            )}
          </Pressable>
        )}
      />

      <View className="absolute bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200">
        <Pressable
          onPress={() => navigation.navigate("DeviceForm")}
          className="h-12 rounded-xl items-center justify-center bg-blue-600"
        >
          <Text className="text-white font-semibold">Add Device</Text>
        </Pressable>
      </View>
    </View>
  );
}
