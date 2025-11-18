// src/components/full-floor-map-screen/SvgMapViewer.tsx
import React from "react";
import { View, StyleSheet, Dimensions } from "react-native";
import { SvgXml } from "react-native-svg";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, { useSharedValue, useAnimatedStyle } from "react-native-reanimated";

const { width, height } = Dimensions.get("window");
type Props = { svgXml: string };

export default function SvgMapViewer({ svgXml }: Props) {
  const scale = useSharedValue(1);
  const tx = useSharedValue(0);
  const ty = useSharedValue(0);

  const pan = Gesture.Pan().onUpdate((e) => { tx.value = e.translationX; ty.value = e.translationY; });
  const pinch = Gesture.Pinch().onUpdate((e) => { scale.value = Math.max(1, Math.min(3, e.scale)); });
  const gesture = Gesture.Simultaneous(pan, pinch);

  const anim = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }, { translateX: tx.value }, { translateY: ty.value }],
  }));

  return (
    <View style={styles.container}>
      <GestureDetector gesture={gesture}>
        <Animated.View style={[styles.wrap, anim]}>
          <SvgXml xml={svgXml} width="100%" height="100%" />
        </Animated.View>
      </GestureDetector>
    </View>
  );
}
const styles = StyleSheet.create({ container:{flex:1,backgroundColor:"#fff"}, wrap:{width, height} });
