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
      setDevices(
        items
          .filter((d) => d.status === "issue")
          .slice()
          .sort((a, b) => {
            const toMs = (v: any) => {
              if (!v) return 0;
              if (typeof v.toDate === "function") return v.toDate().getTime();
              if (v instanceof Date) return v.getTime();
              if (typeof v === "number") return v;
              const n = new Date(v).getTime();
              return Number.isFinite(n) ? n : 0;
            };

            const at = toMs((a as any).issueStartAt ?? (a as any).updatedAt);
            const bt = toMs((b as any).issueStartAt ?? (b as any).updatedAt);
            return bt - at;
          })
      );
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
    <View className="flex-1">
      <View className="px-4 pt-4">
        <Header title="Alerts" />
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
