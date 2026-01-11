// src/screens/devices/DevicesListScreen.tsx
import { useEffect, useState } from "react";
import { View, Text, FlatList, ActivityIndicator } from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { DevicesStackNavProps } from "../../navigators/types";
import type { DeviceItem } from "../../types/device";
import { subscribeDevices } from "../../services/devices.service";
import { DEVICE_STATUSES } from "../../types/deviceStatuses";
import Header from "../../components/Header";
import DeviceListItem from "../../components/devices/DeviceListItem";
import Button from "../../components/Button";

const DevicesListScreen = () => {
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
    <View className="flex-1 bg-gray-50 p-4">
      <Header title="Devices" />
      <FlatList
        data={DEVICE_STATUSES.map((s) => ({
          key: s.key,
          title: s.label,
          data: devices.filter((d) => d.status === s.key),
        }))}
        keyExtractor={(item) => item.key}
        contentContainerStyle={{ paddingBottom: 96 }}
        ListEmptyComponent={
          <View className="py-10 items-center">
            <Text className="text-gray-600">No devices yet.</Text>
          </View>
        }
        renderItem={({ item }) => (
          <View className="mb-8">
            <View className="mb-3 flex-row items-center justify-between">
              <Text className="text-sm font-semibold text-gray-700">
                {item.title}
              </Text>
              <Text className="text-xs text-gray-400">
                {item.data.length}
              </Text>
            </View>

            {item.data.length === 0 ? (
              <View className="rounded-xl border border-dashed border-gray-200 p-4 items-center">
                <Text className="text-xs text-gray-400">No devices in this category.</Text>
              </View>
            ) : (
              item.data.map((device) => (
                <View key={device.id}>
                  <DeviceListItem
                    device={device}
                    onPress={() => navigation.navigate("DeviceDetail", { device })}
                  />
                </View>
              ))
            )}
          </View>
        )}
      />

      <View className="absolute bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200">
        <Button
          label="Add Device"
          onPress={() => navigation.navigate("DeviceForm")}
          variant="primary"
          className="w-full"
        />
      </View>
    </View>
  );
}
export default DevicesListScreen;
