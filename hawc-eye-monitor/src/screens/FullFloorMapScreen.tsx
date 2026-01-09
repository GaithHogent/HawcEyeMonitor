// src/screens/FullFloorMapScreen.tsx
import { StyleSheet } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";

import Floor1Svg from "../components/full-floor-map-screen/Floor1Svg";
import Floor2Svg from "../components/full-floor-map-screen/Floor2Svg";
import Floor3Svg from "../components/full-floor-map-screen/Floor3Svg";

type Params = { floorId: string };

export default function FullFloorMapScreen() {
  const navigation = useNavigation<any>();
  const { params } = useRoute<any>();
  const { floorId } = params as Params;

  const goToRoom = (roomId: string) => {
    navigation.navigate("Room", { floorId, roomId });
  };

  return (
    <>
      {floorId === "1" ? (
        <Floor1Svg onRoomPress={goToRoom} />
      ) : floorId === "2" ? (
        <Floor2Svg onRoomPress={goToRoom} />
      ) : (
        <Floor3Svg onRoomPress={goToRoom} />
      )}
    </>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
});
