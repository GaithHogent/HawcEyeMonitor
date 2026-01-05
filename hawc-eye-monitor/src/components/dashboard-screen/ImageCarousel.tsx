// src/components/dashboard-screen/ImageCarousel.tsx
import { useEffect, useRef, useState } from "react";
import {
  View,
  Image,
  TouchableOpacity,
  ScrollView,
  Modal,
  Dimensions,
  StyleSheet,
  ImageSourcePropType,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get("window");

type Props = { images: ImageSourcePropType[] };

export default function ImageCarousel({ images }: Props) {
  const [index, setIndex] = useState(0);
  const [viewer, setViewer] = useState(false);
  const scroller = useRef<ScrollView>(null);
  const modalScroller = useRef<ScrollView>(null);

  const BANNER_W = SCREEN_W - 32;
  const BANNER_H = 240;

  const goTo = (i: number, inModal = false) => {
    const next = (i + images.length) % images.length;
    setIndex(next);
    const x = next * (inModal ? SCREEN_W : BANNER_W);
    (inModal ? modalScroller : scroller).current?.scrollTo({ x, animated: true });
  };

  useEffect(() => {
    const id = setInterval(() => goTo(index + 1), 5000);
    return () => clearInterval(id);
  }, [index]);

  return (
    <>
      <View style={[styles.bannerWrap, { width: BANNER_W, height: BANNER_H }]}>
        <ScrollView
          ref={scroller}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={(e) => {
            const i = Math.round(e.nativeEvent.contentOffset.x / BANNER_W);
            setIndex(i);
          }}
        >
          {images.map((src, i) => (
            <TouchableOpacity key={i} activeOpacity={0.9} onPress={() => setViewer(true)}>
              <Image source={src} style={[styles.banner, { width: BANNER_W, height: BANNER_H }]} />
            </TouchableOpacity>
          ))}
        </ScrollView>

        <TouchableOpacity style={[styles.arrow, { left: 8 }]} onPress={() => goTo(index - 1)}>
          <MaterialCommunityIcons name="chevron-left" size={28} color="#111" />
        </TouchableOpacity>
        <TouchableOpacity style={[styles.arrow, { right: 8 }]} onPress={() => goTo(index + 1)}>
          <MaterialCommunityIcons name="chevron-right" size={28} color="#111" />
        </TouchableOpacity>
      </View>

      <Modal visible={viewer} animationType="fade" transparent onRequestClose={() => setViewer(false)}>
        <View style={styles.modalRoot}>
          <TouchableOpacity style={styles.closeBtn} onPress={() => setViewer(false)}>
            <MaterialCommunityIcons name="close" size={26} color="#fff" />
          </TouchableOpacity>

          <ScrollView
            ref={modalScroller}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onLayout={() => {
              setTimeout(() => {
                modalScroller.current?.scrollTo({ x: index * SCREEN_W, animated: false });
              }, 0);
            }}
            onMomentumScrollEnd={(e) => {
              const i = Math.round(e.nativeEvent.contentOffset.x / SCREEN_W);
              setIndex(i);
            }}
          >
            {images.map((src, i) => (
              <View key={i} style={{ width: SCREEN_W, height: SCREEN_H, alignItems: "center", justifyContent: "center" }}>
                <Image source={src} style={styles.fullImage} />
              </View>
            ))}
          </ScrollView>

          <TouchableOpacity style={[styles.modalArrow, { left: 12 }]} onPress={() => goTo(index - 1, true)}>
            <MaterialCommunityIcons name="chevron-left" size={36} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.modalArrow, { right: 12 }]} onPress={() => goTo(index + 1, true)}>
            <MaterialCommunityIcons name="chevron-right" size={36} color="#fff" />
          </TouchableOpacity>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  bannerWrap: {
    alignSelf: "center",
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 20,
  },
  banner: { resizeMode: "cover" },
  arrow: {
    position: "absolute",
    top: "45%",
    backgroundColor: "rgba(255,255,255,0.85)",
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  modalRoot: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.95)",
  },
  closeBtn: {
    position: "absolute",
    top: 40,
    right: 16,
    zIndex: 2,
    padding: 6,
  },
  fullImage: {
    width: SCREEN_W,
    height: SCREEN_H,
    resizeMode: "contain",
  },
  modalArrow: {
    position: "absolute",
    top: "50%",
    marginTop: -22,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(0,0,0,0.35)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.6)",
  },
});
