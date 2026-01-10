// src/screens/DashboardScreen.tsx
import { ScrollView, View, Text, StyleSheet, Pressable } from "react-native";
import { useEffect, useMemo, useState } from "react";
import ImageCarousel from "../components/dashboard-screen/ImageCarousel";
import StatsGrid from "../components/dashboard-screen/StatsGrid";
import Header from "../components/Header";
import { subscribeDevices } from "../services/devices.service";
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

  const [devices, setDevices] = useState<DeviceItem[]>([]);

  useEffect(() => {
    const unsub = subscribeDevices((items) => {
      setDevices(items);
    });
    return unsub;
  }, []);

  const totalDevices = devices.length;
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
    { label: "Active Alerts", value: activeAlerts, color: "#ef4444" },
    { label: "Devices Offline", value: devicesOffline, color: "#fb923c" },
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Header title="Dashboard" />

      {/* معرض الصور */}
      <ImageCarousel images={images} />

      {/* بطاقات المعلومات */}
      <StatsGrid stats={stats} />

      {/* Official Website Button */}
      <Pressable style={styles.websiteButton} onPress={() => navigation.navigate("Website")}>
        <View style={styles.websiteButtonRow}>
          <View style={styles.websiteButtonLeft}>
            <MaterialCommunityIcons name="web" size={22} color="#ffffff" />
            <Text style={styles.websiteButtonText}>Visit our official website</Text>
          </View>
          <MaterialCommunityIcons name="chevron-right" size={22} color="#ffffff" />
        </View>
      </Pressable>

      {/* التنبيهات الأخيرة */}
      <Text style={styles.sectionTitle}>Latest Alerts</Text>

      {latestAlerts.length === 0 ? (
        <View style={styles.listItem}>
          <Text style={styles.muted}>No active issues.</Text>
        </View>
      ) : (
        latestAlerts.map((item) => (
          <View key={item.id} style={styles.listItem}>
            <Text style={[styles.alertTitle, { color: "#ef4444" }]} numberOfLines={1}>
              {item.issueType || item.name}
            </Text>
            {!!item.issueDescription && (
              <Text style={styles.muted} numberOfLines={2}>
                {item.issueDescription}
              </Text>
            )}
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f7f7f7" },
  content: { padding: 16 },
  sectionTitle: {
    marginTop: 20,
    marginBottom: 8,
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
  },
  listItem: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
  },
  alertTitle: { fontWeight: "700" },
  muted: { marginTop: 4, fontSize: 12, color: "#6b7280" },

  websiteButton: {
    marginTop: 12,
    marginBottom: 10,
    backgroundColor: "#0d7ff2",
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 14,
  },
  websiteButtonRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  websiteButtonLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  websiteButtonText: {
    marginLeft: 10,
    fontSize: 15,
    fontWeight: "800",
    color: "#ffffff",
  },
});

export default DashboardScreen;
