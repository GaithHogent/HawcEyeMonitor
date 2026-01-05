// src/screens/AlertsCenterScreen.tsx
import { View, Text, FlatList, StyleSheet } from "react-native";
import Header from "../components/Header";

const ALERTS = [
  { id: "1", title: "Smoke detected", floor: "2", time: "10:24 AM" },
  { id: "2", title: "Sensor offline", floor: "1", time: "09:58 AM" },
];

export default function AlertsCenterScreen() {
  const renderItem = ({ item }: any) => (
    <View style={styles.item}>
      <Text style={[styles.itemTitle, { color: "#ef4444" }]}>{item.title}</Text>
      <Text style={styles.itemSub}>Floor {item.floor} • {item.time}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Header title="Alerts Center" />
      <FlatList
        data={ALERTS}
        keyExtractor={(it) => it.id}
        renderItem={renderItem}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f7f7f7", padding: 16 },
  item: { backgroundColor: "#fff", borderRadius: 16, padding: 14, marginBottom: 10, elevation: 1 },
  itemTitle: { fontWeight: "700" },
  itemSub: { marginTop: 6, fontSize: 12, color: "#6b7280" },
});
