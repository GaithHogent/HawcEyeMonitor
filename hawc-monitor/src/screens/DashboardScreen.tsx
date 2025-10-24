import React from "react";
import { ScrollView, View, Text, StyleSheet } from "react-native";

export default function DashboardScreen() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Hawc Monitor Dashboard</Text>

      <View style={styles.grid}>
        <View style={styles.card}>
          <Text style={styles.cardLabel}>Total Devices</Text>
          <Text style={[styles.cardValue, { color: "#111" }]}>124</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardLabel}>Active Alerts</Text>
          <Text style={[styles.cardValue, { color: "#ef4444" }]}>5</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardLabel}>Open Tickets</Text>
          <Text style={[styles.cardValue, { color: "#f59e0b" }]}>3</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardLabel}>Devices Offline</Text>
          <Text style={[styles.cardValue, { color: "#fb923c" }]}>2</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Latest Alerts</Text>

      <View style={styles.listItem}>
        <Text style={[styles.alertTitle, { color: "#ef4444" }]}>Smoke Detected - Floor 2</Text>
        <Text style={styles.muted}>10:24 AM</Text>
      </View>

      <View style={styles.listItem}>
        <Text style={[styles.alertTitle, { color: "#f59e0b" }]}>Sensor Offline - Floor 1</Text>
        <Text style={styles.muted}>09:58 AM</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f7f7f7" },
  content: { padding: 16 },
  title: { fontSize: 22, fontWeight: "700", color: "#0d7ff2", textAlign: "center", marginBottom: 16 },
  grid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", gap: 12 as any },
  card: { width: "48%", backgroundColor: "#fff", borderRadius: 16, padding: 12, elevation: 1 },
  cardLabel: { color: "#6b7280", fontSize: 12 },
  cardValue: { marginTop: 6, fontSize: 26, fontWeight: "800" },
  sectionTitle: { marginTop: 20, marginBottom: 8, fontSize: 16, fontWeight: "700", color: "#111827" },
  listItem: { backgroundColor: "#fff", borderRadius: 12, padding: 12, marginBottom: 10 },
  alertTitle: { fontWeight: "700" },
  muted: { marginTop: 4, fontSize: 12, color: "#6b7280" },
});
