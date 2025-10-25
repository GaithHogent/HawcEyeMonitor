import React from "react";
import { ScrollView, View, Text, StyleSheet } from "react-native";
import ImageCarousel from "../components/dashboard-screen/ImageCarousel";
import StatsGrid from "../components/dashboard-screen/StatsGrid";
import Header from "../components/Header";

export default function DashboardScreen() {
  const images = [
    require("../../assets/hawc1.png"),
    require("../../assets/hawc2.png"),
    require("../../assets/hawc3.png"),
    require("../../assets/hawc4.png"),
  ];

  const stats = [
    { label: "Total Devices", value: 124, color: "#111" },
    { label: "Active Alerts", value: 5, color: "#ef4444" },
    { label: "Open Tickets", value: 3, color: "#f59e0b" },
    { label: "Devices Offline", value: 2, color: "#fb923c" },
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Header title="Dashboard" />

      {/* معرض الصور */}
      <ImageCarousel images={images} />

      {/* بطاقات المعلومات */}
      <StatsGrid stats={stats} />

      {/* التنبيهات الأخيرة */}
      <Text style={styles.sectionTitle}>Latest Alerts</Text>

      <View style={styles.listItem}>
        <Text style={[styles.alertTitle, { color: "#ef4444" }]}>
          Smoke Detected - Floor 2
        </Text>
        <Text style={styles.muted}>10:24 AM</Text>
      </View>

      <View style={styles.listItem}>
        <Text style={[styles.alertTitle, { color: "#f59e0b" }]}>
          Sensor Offline - Floor 1
        </Text>
        <Text style={styles.muted}>09:58 AM</Text>
      </View>
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
});
