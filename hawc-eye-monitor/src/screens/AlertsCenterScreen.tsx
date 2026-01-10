// src/screens/AlertsCenterScreen.tsx
import { useEffect, useState } from "react";
import { View, Text, FlatList, Pressable, ActivityIndicator } from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { DevicesStackNavProps } from "../navigators/types";
import type { DeviceItem } from "../types/device";
import { subscribeDevices } from "../services/devices.service";
import Header from "../components/Header";

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
    <View className="flex-1 bg-gray-50 p-4">
      <Header title="Alerts" />

      <FlatList
        data={devices}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={
          <View className="py-10 items-center">
            <Text className="text-gray-600">No active issues.</Text>
          </View>
        }
        renderItem={({ item }) => (
          <Pressable
            onPress={() =>
              navigation.navigate("DeviceDetail", { device: item })
            }
            className="mb-3 rounded-2xl bg-white p-4 shadow-sm"
          >

            <View className="flex-row items-center justify-between">
              <View className="flex-1">
                <Text className="text-base font-semibold text-gray-900" numberOfLines={1}>
                  {item.name}
                </Text>

                {!!item.issueType && (
                  <Text className="mt-1 text-sm text-red-700" numberOfLines={1}>
                    {item.issueType}
                  </Text>
                )}

                {!!item.issueDescription && (
                  <Text className="mt-1 text-sm text-gray-600" numberOfLines={2}>
                    {item.issueDescription}
                  </Text>
                )}

                <Text className="mt-2 text-xs text-gray-400">
                  Tap to view details
                </Text>
              </View>
            </View>
          </Pressable>
        )}
      />
    </View>
  );
};

export default AlertsCenterScreen;
