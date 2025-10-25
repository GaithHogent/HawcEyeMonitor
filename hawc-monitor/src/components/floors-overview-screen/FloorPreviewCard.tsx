// src/components/floors-overview-screen/FloorPreviewCard.tsx
import React from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet, ImageSourcePropType } from "react-native";

type Props = {
  image: ImageSourcePropType;
  title: string;
  onView?: () => void;
};

export default function FloorPreviewCard({ image, title, onView }: Props) {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>{title}</Text>
      <Image source={image} style={styles.image} />
      <TouchableOpacity style={styles.btn} onPress={onView}>
        <Text style={styles.btnText}>View Map</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: "100%",
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 10,
    marginBottom: 14,
    elevation: 1,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  title: {
    textAlign: "center",
    fontSize: 16,
    fontWeight: "700",
    color: "#0d7ff2",
    marginBottom: 6,
  },
  image: {
    width: "100%",
    height: 110,
    borderRadius: 10,
    resizeMode: "cover",
  },
  btn: {
    marginTop: 8,
    alignSelf: "center",
    backgroundColor: "#0d7ff2",
    paddingVertical: 7,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  btnText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 13,
  },
});
