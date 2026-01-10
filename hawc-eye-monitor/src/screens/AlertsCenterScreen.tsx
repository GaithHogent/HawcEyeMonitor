// src/screens/AlertsCenterScreen.tsx
import { useEffect, useState } from "react";
import { View, Text, FlatList, Pressable, ActivityIndicator } from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { DevicesStackNavProps } from "../navigators/types";
import type { DeviceItem } from "../types/device";
import { subscribeDevices } from "../services/devices.service";
import Header from "../components/Header";
import DeviceListItem from "../components/devices/DeviceListItem";
import { MaterialCommunityIcons } from "@expo/vector-icons";

const AlertsCenterScreen = () => {
const navigation = useNavigation<DevicesStackNavProps<"DeviceDetail">["navigation"]>();
  const [devices, setDevices] = useState<DeviceItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = subscribeDevices((items) => {
      setDevices(items.filter((d) => d.status === "issue"));
      setLoading(false);
    });
    return unsub;
  }, []);

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator />
        <Text className="mt-3 text-gray-600">Loading alerts...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      <View className="px-4 pt-4">
        <Header title="Alerts" />

        <View className="mt-3 mb-2 rounded-2xl bg-white p-4 shadow-sm">
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center">
              <MaterialCommunityIcons name="alert-circle-outline" size={20} color="#ef4444" />
              <Text className="ml-2 text-base font-semibold text-gray-900">
                Active Issues
              </Text>
            </View>
            <View className="rounded-full bg-red-100 px-2.5 py-1">
              <Text className="text-xs font-semibold text-red-700">
                {devices.length}
              </Text>
            </View>
          </View>
          <Text className="mt-1 text-sm text-gray-500">
            Devices currently reporting problems
          </Text>
        </View>
      </View>

      <FlatList
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 16 }}
        data={devices}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={
          <View className="py-14 items-center">
            <View className="mb-3 h-12 w-12 items-center justify-center rounded-full bg-gray-100">
              <MaterialCommunityIcons name="check-circle-outline" size={24} color="#10b981" />
            </View>
            <Text className="text-base font-semibold text-gray-900">All clear</Text>
            <Text className="mt-1 text-sm text-gray-500">No active issues.</Text>
          </View>
        }
        renderItem={({ item }) => (
          <DeviceListItem
            device={item}
            onPress={() =>
              navigation.navigate("DeviceDetail", { device: item })
            }
          />
        )}
      />
    </View>
  );
};

export default AlertsCenterScreen;
