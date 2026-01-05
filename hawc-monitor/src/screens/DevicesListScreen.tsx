// src/screens/DevicesListScreen.tsx
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from "react-native";
import Header from "../components/Header";

const DEVICES = [
  { id: "1", name: "Camera A1", type: "Camera", floor: "1", status: "Normal" },
  { id: "2", name: "Smoke Sensor B2", type: "Smoke Sensor", floor: "2", status: "Warning" },
  { id: "3", name: "Fire Alarm C1", type: "Alarm", floor: "1", status: "Error" },
];

export default function DevicesListScreen() {
  const renderItem = ({ item }: any) => (
    <TouchableOpacity style={styles.item}>
      <Text style={styles.itemTitle}>{item.name}</Text>
      <Text style={styles.itemSub}>{item.type} • Floor {item.floor}</Text>
      <Text style={[
        styles.itemStatus,
        item.status === "Normal" ? styles.green : item.status === "Warning" ? styles.yellow : styles.red
      ]}>
        {item.status}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Header title="Devices" />
      <FlatList
        data={DEVICES}
        keyExtractor={(it) => it.id}
        contentContainerStyle={{ paddingBottom: 80 }}
        renderItem={renderItem}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f7f7f7", padding: 16 },
  item: { backgroundColor: "#fff", borderRadius: 16, padding: 14, marginBottom: 10, elevation: 1 },
  itemTitle: { fontSize: 16, fontWeight: "700", color: "#111827" },
  itemSub: { marginTop: 4, fontSize: 13, color: "#6b7280" },
  itemStatus: { marginTop: 6, fontWeight: "700" },
  green: { color: "#10b981" },
  yellow: { color: "#f59e0b" },
  red: { color: "#ef4444" },
});
