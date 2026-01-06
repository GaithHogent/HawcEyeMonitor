// src/screens/FloorsOverviewScreen.tsx
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
    image: require("../../assets/floors/thumbnail/floor1.png"), // thumbnail
  },
  {
    id: "2",
    title: "Floor 2",
    image: require("../../assets/floors/thumbnail/floor2.png"),
  },
  {
    id: "3",
    title: "Floor 3",
    image: require("../../assets/floors/thumbnail/floor3.png"),
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
