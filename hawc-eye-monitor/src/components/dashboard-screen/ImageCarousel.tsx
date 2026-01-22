// src/components/dashboard-screen/ImageCarousel.tsx
import { useEffect, useRef, useState } from "react";
import {
  View,
  Image,
  TouchableOpacity,
  ScrollView,
  Modal,
  Dimensions,
  ImageSourcePropType,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get("window");

type Props = { images: ImageSourcePropType[] };

const ImageCarousel = ({ images }: Props) => {
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
      <View
        className="self-center rounded-xl overflow-hidden mb-5"
        style={{ width: BANNER_W, height: BANNER_H }}
      >
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
              <Image
                source={src}
                className="object-cover"
                style={{ width: BANNER_W, height: BANNER_H }}
              />
            </TouchableOpacity>
          ))}
        </ScrollView>

        <TouchableOpacity
          className="absolute top-[45%] left-2 bg-white/85 w-9 h-9 rounded-full items-center justify-center"
          onPress={() => goTo(index - 1)}
        >
          <MaterialCommunityIcons name="chevron-left" size={28} color="#111" />
        </TouchableOpacity>

        <TouchableOpacity
          className="absolute top-[45%] right-2 bg-white/85 w-9 h-9 rounded-full items-center justify-center"
          onPress={() => goTo(index + 1)}
        >
          <MaterialCommunityIcons name="chevron-right" size={28} color="#111" />
        </TouchableOpacity>
      </View>

      <Modal visible={viewer} animationType="fade" transparent onRequestClose={() => setViewer(false)}>
        <View className="flex-1 bg-black/95">
          <TouchableOpacity
            className="absolute top-10 right-4 z-10 p-1.5"
            onPress={() => setViewer(false)}
          >
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
              <View
                key={i}
                className="items-center justify-center"
                style={{ width: SCREEN_W, height: SCREEN_H }}
              >
                <Image
                  source={src}
                  resizeMode="contain"
                  style={{ width: SCREEN_W, height: SCREEN_H }}
                />
              </View>
            ))}
          </ScrollView>

          <TouchableOpacity
            className="absolute top-1/2 -mt-[22px] left-3 w-11 h-11 rounded-full bg-black/35 items-center justify-center border border-white/60"
            onPress={() => goTo(index - 1, true)}
          >
            <MaterialCommunityIcons name="chevron-left" size={36} color="#fff" />
          </TouchableOpacity>

          <TouchableOpacity
            className="absolute top-1/2 -mt-[22px] right-3 w-11 h-11 rounded-full bg-black/35 items-center justify-center border border-white/60"
            onPress={() => goTo(index + 1, true)}
          >
            <MaterialCommunityIcons name="chevron-right" size={36} color="#fff" />
          </TouchableOpacity>
        </View>
      </Modal>
    </>
  );
};
export default ImageCarousel;
