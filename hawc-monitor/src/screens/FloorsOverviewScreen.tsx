import React from "react";
import { ScrollView, StyleSheet } from "react-native";
import Header from "../components/Header";
import FloorPreviewCard from "../components/floors-overview-screen/FloorPreviewCard";

export default function FloorsOverviewScreen() {
  const floors = [
    {
      title: "Floor 1",
      image: require("../../assets/floor1.png"),
    },
    {
      title: "Floor 2",
      image: require("../../assets/floor2.png"),
    },
    {
      title: "Floor 3",
      image: require("../../assets/floor3.png"),
    },
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Header title="Building Floors" subtitle="Select a floor to view details" />

      {floors.map((f, i) => (
        <FloorPreviewCard
          key={i}
          image={f.image}
          title={f.title}
          onView={() => {
            // سينتقل لاحقًا إلى صفحة خريطة الطابق
            console.log("Navigate to full map for", f.title);
          }}
        />
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f7f7f7" },
  content: { padding: 16 },
});
