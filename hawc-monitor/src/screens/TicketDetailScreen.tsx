// src/screens/TicketDetailScreen.tsx
import { ScrollView, View, Text, TouchableOpacity, StyleSheet } from "react-native";
import Header from "../components/Header";

export default function TicketDetailScreen() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Header title="Ticket Detail" />

      <View style={styles.card}>
        <Text style={styles.name}>Fire Sensor not responding</Text>
        <Text style={styles.kv}>
          Status:{" "}
          <Text style={[styles.v, { color: "#f59e0b", fontWeight: "700" }]}>
            Open
          </Text>
        </Text>
        <Text style={styles.kv}>
          Priority: <Text style={styles.v}>High</Text>
        </Text>
        <Text style={[styles.kv, { marginTop: 8 }]}>
          Description:{" "}
          <Text style={styles.v}>
            Sensor failed to send data for 10 minutes.
          </Text>
        </Text>
        <Text style={[styles.kv, { marginTop: 8 }]}>
          Reported By: <Text style={styles.v}>Admin</Text>
        </Text>
        <Text style={[styles.kv, { marginTop: 8 }]}>
          Created At: <Text style={styles.v}>2025-10-24 10:15 AM</Text>
        </Text>
      </View>

      <View style={styles.history}>
        <Text style={styles.section}>Updates</Text>
        <View style={styles.historyItem}>
          <Text style={styles.historyTime}>10:30 AM</Text>
          <Text style={styles.historyText}>Technician assigned to check device.</Text>
        </View>
        <View style={styles.historyItem}>
          <Text style={styles.historyTime}>10:45 AM</Text>
          <Text style={styles.historyText}>Device rebooted remotely.</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.resolveBtn}>
        <Text style={styles.resolveText}>Mark as Resolved</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f7f7f7" },
  content: { padding: 16 },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 14,
    elevation: 1,
    marginBottom: 16,
  },
  name: { fontSize: 18, fontWeight: "700", color: "#111827", marginBottom: 8 },
  kv: { color: "#4b5563", marginTop: 4, lineHeight: 20 },
  v: { color: "#111827" },
  section: { fontSize: 16, fontWeight: "700", color: "#111827", marginBottom: 8 },
  history: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 14,
    elevation: 1,
    marginBottom: 20,
  },
  historyItem: { marginBottom: 8 },
  historyTime: { fontSize: 12, color: "#6b7280" },
  historyText: { fontSize: 14, color: "#111827", marginTop: 2 },
  resolveBtn: {
    backgroundColor: "#10b981",
    paddingVertical: 14,
    borderRadius: 16,
  },
  resolveText: { color: "#fff", textAlign: "center", fontWeight: "700" },
});
