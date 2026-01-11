// src/components/floors-overview-screen/FloorPreviewCard.tsx
import { View, Text, Image, ImageSourcePropType } from "react-native";
import Button from "../Button";

type Props = {
  image: ImageSourcePropType;
  title: string;
  onView?: () => void;
};

const FloorPreviewCard = ({ image, title, onView }: Props) => {
  return (
    <View className="w-full bg-white rounded-[14px] p-2.5 mb-3.5 shadow-sm">
      <Text className="text-center text-base font-bold text-blue-600 mb-1.5">{title}</Text>
      <Image source={image} className="w-full h-[110px] rounded-[10px] resize-cover" />
      <View className="mt-2 self-center">
        <Button label="View Map" onPress={onView ?? (() => {})} className="h-10" />
      </View>
    </View>
  );
}

export default FloorPreviewCard;
