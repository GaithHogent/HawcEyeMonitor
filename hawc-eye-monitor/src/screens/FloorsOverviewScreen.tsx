// src/screens/FloorsOverviewScreen.tsx
import { ScrollView } from "react-native";
import { useNavigation } from "@react-navigation/native";
import Header from "../components/Header";
import FloorPreviewCard from "../components/floors-overview-screen/FloorPreviewCard";

const FloorsOverviewScreen = () => {
  const navigation = useNavigation<any>();

  const floorImage = require("../../assets/floor-thumbnail.png");

  const floors = [
  {
    id: "1",
    title: "Floor 1",
  },
  {
    id: "2",
    title: "Floor 2",
  },
  {
    id: "3",
    title: "Floor 3",
  },
];


  return (
    <ScrollView className="flex-1 bg-gray-100" contentContainerStyle={{ padding: 16 }}>
      <Header title="Building Floors" subtitle="Select a floor to view details" />

      {floors.map((f, i) => (
        <FloorPreviewCard
          key={i}
          image={floorImage}
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

export default FloorsOverviewScreen;
