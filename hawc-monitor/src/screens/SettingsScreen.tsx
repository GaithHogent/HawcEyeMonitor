import React from "react";
import { View, Text, TouchableOpacity, Switch, StyleSheet } from "react-native";
import Header from "../components/Header";

export default function SettingsScreen() {
  return (
    <View style={styles.container}>
      <Header title="Settings" />

      <View style={styles.row}>
        <Text style={styles.rowText}>Dark Mode</Text>
        <Switch />
      </View>

      <View style={styles.row}>
        <Text style={styles.rowText}>Notifications</Text>
        <Switch />
      </View>

      <TouchableOpacity style={styles.logoutBtn}>
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f7f7f7", padding: 16 },
  row: { backgroundColor: "#fff", borderRadius: 16, padding: 14, marginBottom: 10, elevation: 1, flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  rowText: { color: "#111827", fontSize: 15 },
  logoutBtn: { backgroundColor: "#ef4444", paddingVertical: 14, borderRadius: 16, marginTop: 24 },
  logoutText: { color: "#fff", textAlign: "center", fontWeight: "700" },
});
