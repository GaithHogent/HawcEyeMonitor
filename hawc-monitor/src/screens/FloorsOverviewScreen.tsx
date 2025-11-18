import React from "react";
import { ScrollView, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import Header from "../components/Header";
import FloorPreviewCard from "../components/floors-overview-screen/FloorPreviewCard";

export default function FloorsOverviewScreen() {
  const navigation = useNavigation<any>();

  const floors = [
  {
    id: "1",
    title: "Floor 1",
    image: require("../../assets/floor1.png"), // thumbnail
    svg: require("../../assets/floors/floor1.svg"),   // full map
  },
  {
    id: "2",
    title: "Floor 2",
    image: require("../../assets/floor2.png"),
    svg: require("../../assets/floors/floor2.svg"),
  },
  {
    id: "3",
    title: "Floor 3",
    image: require("../../assets/floor3.png"),
    svg: require("../../assets/floors/floor3.svg"),
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
          onView={() =>
            navigation.navigate("FullFloorMap", {
              floorId: f.id,
              svgPath: f.svg,
            })
          }
        />
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f7f7f7" },
  content: { padding: 16 },
});
