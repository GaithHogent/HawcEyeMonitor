import React from "react";
import { ScrollView, View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";
import Header from "../components/Header";

export default function FloorMapScreen() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Header title="Floor 1 Map" />

      <View style={styles.card}>
        <Image
          source={require("../../assets/floor-plan.png")}
          style={styles.map}
        />
      </View>

      <TouchableOpacity style={styles.primaryBtn}>
        <Text style={styles.primaryBtnText}>Add Device</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f7f7f7" },
  content: { padding: 16 },
  card: { backgroundColor: "#fff", borderRadius: 16, overflow: "hidden", elevation: 1 },
  map: { width: "100%", height: 300, resizeMode: "contain" },
  primaryBtn: { marginTop: 16, backgroundColor: "#0d7ff2", paddingVertical: 14, borderRadius: 16 },
  primaryBtnText: { color: "#fff", textAlign: "center", fontWeight: "700" },
});
