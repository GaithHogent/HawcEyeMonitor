import React from "react";
import { ScrollView, View, Text, StyleSheet } from "react-native";
import Header from "../components/Header";

export default function DeviceDetailScreen() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Header title="Device Details" />

      <View style={styles.card}>
        <Text style={styles.name}>Camera A1</Text>
        <Text style={styles.kv}>Type: <Text style={styles.v}>Camera</Text></Text>
        <Text style={styles.kv}>Floor: <Text style={styles.v}>1</Text></Text>
        <Text style={styles.kv}>Status: <Text style={[styles.v, { color: "#10b981", fontWeight: "700" }]}>Normal</Text></Text>
        <Text style={styles.kv}>Last Update: <Text style={styles.v}>10:20 AM</Text></Text>
      </View>

      <Text style={styles.section}>Maintenance History</Text>
      <View style={styles.card}>
        <Text style={styles.muted}>No tickets found for this device.</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f7f7f7" },
  content: { padding: 16 },
  card: { backgroundColor: "#fff", borderRadius: 16, padding: 14, elevation: 1, marginBottom: 12 },
  name: { fontSize: 18, fontWeight: "700", color: "#111827", marginBottom: 8 },
  kv: { color: "#4b5563", marginTop: 4 },
  v: { color: "#111827" },
  section: { marginTop: 16, marginBottom: 8, fontSize: 16, fontWeight: "700", color: "#111827" },
  muted: { color: "#6b7280", fontSize: 13 },
});
