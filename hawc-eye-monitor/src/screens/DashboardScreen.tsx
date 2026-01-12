// src/screens/DashboardScreen.tsx
import { ScrollView, View, Text, Pressable } from "react-native";
import { useEffect, useMemo, useState } from "react";
import ImageCarousel from "../components/dashboard-screen/ImageCarousel";
import StatsGrid from "../components/dashboard-screen/StatsGrid";
import Header from "../components/Header";
import { getCachedDevices, subscribeDevices } from "../services/devices.service";
import type { DeviceItem } from "../types/device";
import { useNavigation } from "@react-navigation/native";
import type { AppStackNavProps } from "../navigators/types";
import { MaterialCommunityIcons } from "@expo/vector-icons";

const DashboardScreen = () => {
  const navigation = useNavigation<AppStackNavProps<"Dashboard">["navigation"]>();
  const images = [
    require("../../assets/company-images/hawc1.png"),
    require("../../assets/company-images/hawc2.png"),
    require("../../assets/company-images/hawc3.png"),
    require("../../assets/company-images/hawc4.png"),
  ];

  const [devices, setDevices] = useState<DeviceItem[]>(() => getCachedDevices() ?? []);

  useEffect(() => {
    const unsub = subscribeDevices((items) => {
      setDevices(items);
    });
    return unsub;
  }, []);

  const totalDevices = devices.length;
  const activeDevices = devices.filter((d) => d.status === "active").length;
  const activeAlerts = devices.filter((d) => d.status === "issue").length;
  const devicesOffline = devices.filter((d) => d.status === "inactive").length;

  const latestAlerts = useMemo(() => {
    return devices
      .filter((d) => d.status === "issue")
      .sort((a, b) => {
        const ta = a.issueStartAt?.seconds ?? 0;
        const tb = b.issueStartAt?.seconds ?? 0;
        return tb - ta;
      })
      .slice(0, 3);
  }, [devices]);

  const stats = [
    { label: "Total Devices", value: totalDevices, color: "#111" },
    { label: "Active Devices", value: activeDevices, color: "#10b981" },
    { label: "Devices With Issues", value: activeAlerts, color: "#ef4444" },
    { label: "Inactive Devices", value: devicesOffline, color: "#fb923c" },
  ];

  return (
    <ScrollView className="flex-1 bg-gray-100" contentContainerStyle={{ padding: 16 }}>
      <Header title="Dashboard" />

      {/* معرض الصور */}
      <ImageCarousel images={images} />

      {/* بطاقات المعلومات */}
      <StatsGrid stats={stats} />

      {/* التنبيهات الأخيرة */}
      <Text className="mt-5 mb-2 text-base font-bold text-gray-900">Latest Alerts</Text>

      {latestAlerts.length === 0 ? (
        <View className="bg-white rounded-xl p-3 mb-2">
          <Text className="mt-1 text-xs text-gray-500">No active issues.</Text>
        </View>
      ) : (
        latestAlerts.map((item) => (
          <View key={item.id} className="bg-white rounded-xl p-3 mb-2">
            <Text className="font-bold text-red-500" numberOfLines={1}>
              {item.issueType || item.name}
            </Text>
            {!!item.issueDescription && (
              <Text className="mt-1 text-xs text-gray-500" numberOfLines={2}>
                {item.issueDescription}
              </Text>
            )}
          </View>
        ))
      )}

      {/* Official Website Button */}
      <Pressable
        className="mt-4 mb-6 bg-white rounded-xl px-3 py-3 border border-gray-200"
        onPress={() => navigation.navigate("Website")}
      >
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center">
            <MaterialCommunityIcons name="web" size={20} color="#111827" />
            <Text className="ml-2 text-sm font-bold text-gray-900">
              Visit our official website
            </Text>
          </View>
          <MaterialCommunityIcons name="chevron-right" size={20} color="#9ca3af" />
        </View>
      </Pressable>
    </ScrollView>
  );
}

export default DashboardScreen;
