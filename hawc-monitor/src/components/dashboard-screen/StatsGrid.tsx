// src/components/dashboard-screen/StatsGrid.tsx
import React from "react";
import { View, Text, StyleSheet } from "react-native";

type StatItem = {
  label: string;
  value: string | number;
  color?: string;
};

type Props = {
  stats: StatItem[];
};

export default function StatsGrid({ stats }: Props) {
  return (
    <View style={styles.grid}>
      {stats.map((item, i) => (
        <View key={i} style={styles.card}>
          <Text style={styles.label}>{item.label}</Text>
          <Text style={[styles.value, { color: item.color || "#111" }]}>
            {item.value}
          </Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 12 as any,
  },
  card: {
    width: "48%",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 12,
    elevation: 1,
  },
  label: { color: "#6b7280", fontSize: 12 },
  value: { marginTop: 6, fontSize: 26, fontWeight: "800" },
});
